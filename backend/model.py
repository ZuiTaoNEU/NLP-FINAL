import torch
import torch.nn as nn
from diffusers import (
    UNet2DConditionModel, 
    AutoencoderKL, 
    DDPMScheduler,
    StableDiffusionPipeline
)
from transformers import CLIPTextModel, CLIPTokenizer


class StableDiffusionModel:
    def __init__(self, model_id="CompVis/stable-diffusion-v1-4", device="cuda" if torch.cuda.is_available() else "cpu"):
        self.device = device
        self.model_id = model_id
        
        # CLIP tokenizer and text encoder (frozen)
        self.tokenizer = CLIPTokenizer.from_pretrained(model_id, subfolder="tokenizer")
        self.text_encoder = CLIPTextModel.from_pretrained(model_id, subfolder="text_encoder")
        self.text_encoder.to(device)
        self.text_encoder.requires_grad_(False)  # Freeze text encoder
        
        # VAE encoder and decoder (frozen)
        self.vae = AutoencoderKL.from_pretrained(model_id, subfolder="vae")
        self.vae.to(device)
        self.vae.requires_grad_(False)  # Freeze VAE
        
        # U-Net as the core diffusion model (to be fine-tuned)
        self.unet = UNet2DConditionModel.from_pretrained(model_id, subfolder="unet")
        self.unet.to(device)
        
        # Noise scheduler
        self.noise_scheduler = DDPMScheduler.from_pretrained(model_id, subfolder="scheduler")
        
    def encode_text(self, prompt_batch):
        """Encode text prompts to embeddings using CLIP tokenizer and text encoder"""
        text_inputs = self.tokenizer(
            prompt_batch,
            padding="max_length",
            max_length=self.tokenizer.model_max_length,
            truncation=True,
            return_tensors="pt",
        )
        text_input_ids = text_inputs.input_ids.to(self.device)
        
        with torch.no_grad():
            text_embeddings = self.text_encoder(text_input_ids)[0]
        
        return text_embeddings
    
    def encode_image(self, image_batch):
        """Encode images to latent representations using VAE encoder"""
        with torch.no_grad():
            latents = self.vae.encode(image_batch.to(self.device)).latent_dist.sample()
            latents = latents * self.vae.config.scaling_factor
        
        return latents
    
    def decode_latents(self, latents):
        """Decode latent representations to images using VAE decoder"""
        latents = 1 / self.vae.config.scaling_factor * latents
        
        with torch.no_grad():
            images = self.vae.decode(latents).sample
        
        return images
    
    def save_model(self, output_dir):
        """Save the fine-tuned U-Net model"""
        self.unet.save_pretrained(output_dir)
    
    def load_unet(self, model_path):
        """Load a fine-tuned U-Net model"""
        self.unet = UNet2DConditionModel.from_pretrained(model_path)
        self.unet.to(self.device)
    
    def create_pipeline(self):
        """Create a StableDiffusionPipeline with our models for inference"""
        pipeline = StableDiffusionPipeline.from_pretrained(
            self.model_id,
            unet=self.unet,
            text_encoder=self.text_encoder,
            vae=self.vae,
            tokenizer=self.tokenizer,
        )
        pipeline.to(self.device)
        return pipeline