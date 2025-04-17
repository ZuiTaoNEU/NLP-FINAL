import os
import torch
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from datasets import load_dataset
from tqdm.auto import tqdm
from accelerate import Accelerator
from model import StableDiffusionModel
from utils import base64_to_image, preprocess_image, clean_prompt


class ImageCaptionDataset(Dataset):
    def __init__(self, dataset, tokenizer, size=512):
        self.dataset = dataset
        self.tokenizer = tokenizer
        self.size = size
    
    def __len__(self):
        return len(self.dataset)
    
    def __getitem__(self, idx):
        item = self.dataset[idx]
        
        # Get the caption (text prompt)
        caption = clean_prompt(item["description"])
        
        # Process the base64 image
        try:
            image = base64_to_image(item["image"])
            image_tensor = preprocess_image(image, self.size)
            return {"caption": caption, "image": image_tensor}
        except Exception as e:
            # Skip problematic images
            print(f"Error processing image at index {idx}: {e}")
            return None


def train(
    model_id="CompVis/stable-diffusion-v1-4",
    dataset_name="LeroyDyer/image-description_text_to_image_BASE64",
    output_dir="./finetuned_stable_diffusion",
    train_batch_size=1,
    gradient_accumulation_steps=4,
    learning_rate=1e-5,
    num_epochs=5,
    max_train_steps=None,
    mixed_precision="fp16",
):
    accelerator = Accelerator(
        gradient_accumulation_steps=gradient_accumulation_steps,
        mixed_precision=mixed_precision,
    )
    
    # Initialize the model
    model = StableDiffusionModel(model_id=model_id)
    
    # Load the dataset
    dataset = load_dataset(dataset_name)
    train_dataset = ImageCaptionDataset(dataset["train"], model.tokenizer)
    
    # Create the dataloader
    def collate_fn(examples):
        # Filter out None values (failed image processing)
        examples = [example for example in examples if example is not None]
        if not examples:
            return None
            
        captions = [example["caption"] for example in examples]
        images = torch.stack([example["image"] for example in examples])
        
        return {"captions": captions, "images": images}
    
    train_dataloader = DataLoader(
        train_dataset,
        batch_size=train_batch_size,
        shuffle=True,
        collate_fn=collate_fn,
    )
    
    # Set up the optimizer
    optimizer = torch.optim.AdamW(model.unet.parameters(), lr=learning_rate)
    
    # Prepare for training
    model.unet, optimizer, train_dataloader = accelerator.prepare(
        model.unet, optimizer, train_dataloader
    )
    
    # Calculate the number of training steps
    if max_train_steps is None:
        max_train_steps = num_epochs * len(train_dataloader)
    
    # Training loop
    total_steps = 0
    progress_bar = tqdm(total=max_train_steps)
    
    for epoch in range(num_epochs):
        model.unet.train()
        
        for step, batch in enumerate(train_dataloader):
            if batch is None:
                continue
                
            with accelerator.accumulate(model.unet):
                # Get text embeddings
                text_embeddings = model.encode_text(batch["captions"])
                
                # Convert images to latent space
                latents = model.encode_image(batch["images"])
                
                # Add noise to the latents
                noise = torch.randn_like(latents)
                timesteps = torch.randint(
                    0,
                    model.noise_scheduler.config.num_train_timesteps,
                    (latents.shape[0],),
                    device=latents.device,
                )
                noisy_latents = model.noise_scheduler.add_noise(latents, noise, timesteps)
                
                # Predict the noise
                noise_pred = model.unet(noisy_latents, timesteps, text_embeddings).sample
                
                # Calculate loss
                loss = F.mse_loss(noise_pred, noise, reduction="mean")
                
                # Backpropagate
                accelerator.backward(loss)
                
                # Update parameters
                optimizer.step()
                optimizer.zero_grad()
            
            # Update progress
            progress_bar.update(1)
            progress_bar.set_postfix({"loss": loss.item(), "epoch": epoch})
            total_steps += 1
            
            if total_steps >= max_train_steps:
                break
        
        # Save checkpoint after each epoch
        accelerator.wait_for_everyone()
        unwrapped_unet = accelerator.unwrap_model(model.unet)
        
        # Create the output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Save the U-Net model
        unwrapped_unet.save_pretrained(os.path.join(output_dir, f"unet_epoch_{epoch}"))
    
    # Save the final model
    accelerator.wait_for_everyone()
    unwrapped_unet = accelerator.unwrap_model(model.unet)
    unwrapped_unet.save_pretrained(os.path.join(output_dir, "unet_final"))
    
    print("Fine-tuning complete!")
    return os.path.join(output_dir, "unet_final")


if __name__ == "__main__":
    train()