FROM pytorch/pytorch:latest

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Modify requirements to use compatible versions
RUN sed -i 's/diffusers==0.19.3/diffusers==0.19.0/g' requirements.txt || \
    sed -i 's/diffusers==0.33.1/diffusers==0.19.0/g' requirements.txt || \
    echo "No specific diffusers version found to modify"

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