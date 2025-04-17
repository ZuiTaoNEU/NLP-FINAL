import base64
import io
import re
from PIL import Image
import torch
import numpy as np


def base64_to_image(base64_string):
    """Convert a base64 string to a PIL Image"""
    if "base64," in base64_string:
        base64_string = base64_string.split("base64,")[1]
    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data))
    return image


def image_to_base64(image):
    """Convert a PIL Image to a base64 string"""
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_str}"


def preprocess_image(image, size=512):
    """Preprocess an image for the model"""
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize((size, size))
    image = np.array(image) / 127.5 - 1.0  # Normalize to [-1, 1]
    image = torch.from_numpy(image).permute(2, 0, 1).float()  # [C, H, W]
    return image


def postprocess_image(tensor):
    """Convert tensor output to PIL Image"""
    tensor = tensor.detach().cpu()
    tensor = (tensor + 1) / 2.0  # [-1, 1] -> [0, 1]
    tensor = tensor.clamp(0, 1)
    tensor = tensor.numpy().transpose(1, 2, 0)  # [C, H, W] -> [H, W, C]
    image = Image.fromarray((tensor * 255).astype(np.uint8))
    return image


def clean_prompt(text):
    """Clean prompt text for better results"""
    text = text.strip()
    text = re.sub(r'\s+', ' ', text)  # Replace multiple spaces with a single space
    return text