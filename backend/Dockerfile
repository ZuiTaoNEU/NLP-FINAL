FROM pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create directories for models and data
RUN mkdir -p models
RUN mkdir -p data

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV MODEL_DIR=/app/models
ENV DB_PATH=/app/data/images.db

# Expose the port
EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"]