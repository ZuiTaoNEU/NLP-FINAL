# Full-Stack Text-to-Image Generative AI Web Application

This project implements a full-stack web application using the Stable Diffusion model to generate images from text prompts. The implementation includes both a Python backend for model fine-tuning and inference, and a React frontend for user interaction.

## Architecture Overview

The application consists of the following components:

1. **Backend (Python)**
   - Stable Diffusion model implementation with:
     - CLIP tokenizer for text input processing
     - VAE encoder/decoder for image latent representations
     - U-Net architecture as the core diffusion model
   - Fine-tuning pipeline using the HuggingFace dataset
   - Flask API for serving the model
   - SQLite database for storing generated images and user feedback

2. **Frontend (React)**
   - Modern React application with React Router for navigation
   - Chakra UI for responsive, accessible interface components
   - Image generation interface with advanced parameters
   - Gallery for viewing and managing generated images
   - Retraining interface for model fine-tuning

## Key Features

- Text-to-image generation with customizable parameters
- Generation of image variations
- Image gallery with search and filtering
- User feedback collection for generated images
- Model retraining using the stored images and feedback
- Fine-tuning that only updates the U-Net component while keeping text and image encoders frozen

## Backend Components

### Model Architecture

The Stable Diffusion implementation follows the standard architecture:

- **CLIP Tokenizer & Text Encoder**: Converts text prompts into embeddings (frozen during fine-tuning)
- **VAE Encoder/Decoder**: Handles conversion between image and latent space (frozen during fine-tuning)
- **U-Net**: Core diffusion model that is fine-tuned during training

### Fine-Tuning Pipeline

The fine-tuning process:

1. Loads the HuggingFace dataset (`LeroyDyer/image-description_text_to_image_BASE64`)
2. Preprocesses images and captions
3. Updates only the U-Net parameters while keeping the CLIP and VAE components frozen
4. Saves checkpoints during training
5. Stores the fine-tuned model for later inference

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST | Generate image from text prompt |
| `/api/variations` | POST | Generate variations of an existing image |
| `/api/images` | GET | Get list of generated images |
| `/api/images/<id>` | GET | Get details of a specific image |
| `/api/feedback` | POST | Save user feedback for an image |
| `/api/retrain` | POST | Start model retraining |
| `/api/retrain/status` | GET | Get status of model training |

## Frontend Pages

1. **Image Generator**: Main interface for creating images from text prompts
2. **Gallery**: Browse and manage previously generated images
3. **Image Details**: View and interact with a specific image
4. **Retrain Model**: Configure and initiate model retraining

## Database Schema

The SQLite database includes the following structure:

```sql
CREATE TABLE images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt TEXT NOT NULL,
    image_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seed INTEGER,
    params TEXT,
    feedback INTEGER DEFAULT 0
)
```

## Setup and Installation

### Backend Setup

1. Clone the repository
2. Create a virtual environment
3. Install dependencies:
   ```
   pip install -r backend/requirements.txt
   ```
4. Run the Flask application:
   ```
   python backend/app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## Training and Fine-Tuning

The model fine-tuning process can be initiated through:

1. The web interface (Retrain Model page)
2. Directly running the training script:
   ```
   python backend/fine_tuning.py
   ```

By default, the fine-tuning process starts with the pre-trained Stable Diffusion v1-4 model and updates only the U-Net component using the images in the database.

## Production Considerations

For a production deployment, consider the following:

- Use a more robust database like PostgreSQL
- Implement proper authentication and authorization
- Add model versioning and A/B testing capabilities
- Set up a job queue for handling training and inference tasks
- Deploy the backend on GPU-enabled infrastructure for faster inference
- Implement caching for frequently accessed images

## Future Enhancements

Potential improvements to the system:

- Support for image-to-image generation
- Inpainting and outpainting capabilities
- Style transfer functionality
- Integration with other diffusion models
- Advanced prompt engineering tools
- Batch processing of multiple prompts
- User galleries and sharing options
