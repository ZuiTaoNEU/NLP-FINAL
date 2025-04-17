import torch
from PIL import Image
from model import StableDiffusionModel
from utils import image_to_base64, clean_prompt


class StableDiffusionInference:
    def __init__(self, model_path=None, model_id="CompVis/stable-diffusion-v1-4"):
        """Initialize the inference pipeline with the fine-tuned model"""
        self.model = StableDiffusionModel(model_id=model_id)
        
        # Load the fine-tuned U-Net if provided
        if model_path:
            self.model.load_unet(model_path)
        
        # Create the pipeline
        self.pipeline = self.model.create_pipeline()
        
        # Set generator for reproducibility
        self.generator = torch.Generator(device=self.model.device)
    
    def generate_image(
        self,
        prompt,
        negative_prompt="",
        height=512,
        width=512,
        num_inference_steps=50,
        guidance_scale=7.5,
        seed=None,
    ):
        """Generate an image from a text prompt"""
        # Clean the input prompt
        prompt = clean_prompt(prompt)
        
        # Set the seed if provided
        if seed is not None:
            self.generator.manual_seed(seed)
        else:
            self.generator.seed()
        
        # Generate the image
        with torch.autocast(self.model.device):
            image = self.pipeline(
                prompt=prompt,
                negative_prompt=negative_prompt,
                height=height,
                width=width,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                generator=self.generator,
            ).images[0]
        
        # Convert to base64 for API response
        base64_image = image_to_base64(image)
        
        return {
            "image": base64_image,
            "prompt": prompt,
            "seed": self.generator.initial_seed(),
        }
    
    def generate_variations(
        self,
        image,
        prompt="",
        negative_prompt="",
        strength=0.75,
        num_inference_steps=50,
        guidance_scale=7.5,
        num_variations=4,
    ):
        """Generate variations of an input image using img2img"""
        # Clean the input prompt
        prompt = clean_prompt(prompt) if prompt else ""
        
        # Create a list to store the variations
        variations = []
        
        # Generate the variations
        for i in range(num_variations):
            # Set a different seed for each variation
            seed = torch.randint(0, 2**32, (1,)).item()
            self.generator.manual_seed(seed)
            
            with torch.autocast(self.model.device):
                variation_image = self.pipeline(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    image=image,
                    strength=strength,
                    num_inference_steps=num_inference_steps,
                    guidance_scale=guidance_scale,
                    generator=self.generator,
                ).images[0]
            
            # Convert to base64 for API response
            base64_image = image_to_base64(variation_image)
            
            variations.append({
                "image": base64_image,
                "prompt": prompt,
                "seed": seed,
            })
        
        return variations


if __name__ == "__main__":
    # Example usage
    model_path = "./finetuned_stable_diffusion/unet_final"
    inference = StableDiffusionInference(model_path=model_path)
    
    result = inference.generate_image(
        prompt="A beautiful sunset over the ocean",
        seed=42,
    )
    
    print(f"Generated image with prompt: {result['prompt']}")
    print(f"Seed: {result['seed']}")
    
    # Save the image to a file
    import base64
    from io import BytesIO
    
    image_data = base64.b64decode(result["image"].split(",")[1])
    image = Image.open(BytesIO(image_data))
    image.save("generated_image.png")