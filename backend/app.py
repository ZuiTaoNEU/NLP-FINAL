import os
import json
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

from inference import StableDiffusionInference
from fine_tuning import train
from utils import base64_to_image

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
MODEL_DIR = os.environ.get("MODEL_DIR", "./models")
DB_PATH = os.environ.get("DB_PATH", "./images.db")
FINETUNED_MODEL_PATH = os.path.join(MODEL_DIR, "unet_final")

# Ensure model directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

# Initialize database
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt TEXT NOT NULL,
        image_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        seed INTEGER,
        params TEXT,
        feedback INTEGER DEFAULT 0
    )
    ''')
    conn.commit()
    conn.close()

init_db()

# Initialize the inference model
if os.path.exists(FINETUNED_MODEL_PATH):
    inference = StableDiffusionInference(model_path=FINETUNED_MODEL_PATH)
else:
    # Use the base model if no fine-tuned model exists
    inference = StableDiffusionInference()

@app.route('/api/generate', methods=['POST'])
def generate_image():
    data = request.json
    
    if not data or 'prompt' not in data:
        return jsonify({"error": "Prompt is required"}), 400
    
    prompt = data.get('prompt')
    negative_prompt = data.get('negative_prompt', '')
    height = data.get('height', 512)
    width = data.get('width', 512)
    num_inference_steps = data.get('num_inference_steps', 50)
    guidance_scale = data.get('guidance_scale', 7.5)
    seed = data.get('seed')
    
    try:
        # Generate image
        result = inference.generate_image(
            prompt=prompt,
            negative_prompt=negative_prompt,
            height=height,
            width=width,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            seed=seed,
        )
        
        # Save to database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        params = json.dumps({
            'negative_prompt': negative_prompt,
            'height': height,
            'width': width,
            'num_inference_steps': num_inference_steps,
            'guidance_scale': guidance_scale,
        })
        
        cursor.execute(
            'INSERT INTO images (prompt, image_data, seed, params) VALUES (?, ?, ?, ?)',
            (prompt, result['image'], result['seed'], params)
        )
        
        image_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            "id": image_id,
            "image": result['image'],
            "prompt": result['prompt'],
            "seed": result['seed']
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/variations', methods=['POST'])
def generate_variations():
    data = request.json
    
    if not data or 'image' not in data:
        return jsonify({"error": "Image is required"}), 400
    
    image_data = data.get('image')
    prompt = data.get('prompt', '')
    negative_prompt = data.get('negative_prompt', '')
    strength = data.get('strength', 0.75)
    num_inference_steps = data.get('num_inference_steps', 50)
    guidance_scale = data.get('guidance_scale', 7.5)
    num_variations = data.get('num_variations', 4)
    
    try:
        # Convert base64 to PIL Image
        image = base64_to_image(image_data)
        
        # Generate variations
        results = inference.generate_variations(
            image=image,
            prompt=prompt,
            negative_prompt=negative_prompt,
            strength=strength,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            num_variations=num_variations,
        )
        
        variations = []
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        for result in results:
            params = json.dumps({
                'negative_prompt': negative_prompt,
                'strength': strength,
                'num_inference_steps': num_inference_steps,
                'guidance_scale': guidance_scale,
            })
            
            cursor.execute(
                'INSERT INTO images (prompt, image_data, seed, params) VALUES (?, ?, ?, ?)',
                (result['prompt'], result['image'], result['seed'], params)
            )
            
            variation_id = cursor.lastrowid
            
            variations.append({
                "id": variation_id,
                "image": result['image'],
                "prompt": result['prompt'],
                "seed": result['seed']
            })
        
        conn.commit()
        conn.close()
        
        return jsonify(variations)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/images', methods=['GET'])
def get_images():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        cursor.execute(
            'SELECT id, prompt, image_data, created_at, seed, feedback FROM images ORDER BY created_at DESC LIMIT ? OFFSET ?',
            (limit, offset)
        )
        
        images = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify(images)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/images/<int:image_id>', methods=['GET'])
def get_image(image_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM images WHERE id = ?', (image_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({"error": "Image not found"}), 404
        
        return jsonify(dict(row))
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/feedback', methods=['POST'])
def save_feedback():
    data = request.json
    
    if not data or 'image_id' not in data or 'feedback' not in data:
        return jsonify({"error": "Image ID and feedback are required"}), 400
    
    image_id = data.get('image_id')
    feedback = data.get('feedback')
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('UPDATE images SET feedback = ? WHERE id = ?', (feedback, image_id))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Image not found"}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/retrain', methods=['POST'])
def retrain_model():
    try:
        # Get the training parameters
        data = request.json or {}
        learning_rate = data.get('learning_rate', 1e-5)
        num_epochs = data.get('num_epochs', 5)
        batch_size = data.get('batch_size', 1)
        
        # Start fine-tuning
        output_dir = os.path.join(MODEL_DIR, f"retrained_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        
        # This is a placeholder for starting the training process
        # In a real application, you would likely run this in a separate thread or process
        # to avoid blocking the API
        return jsonify({
            "message": "Retraining started",
            "output_dir": output_dir,
            "parameters": {
                "learning_rate": learning_rate,
                "num_epochs": num_epochs,
                "batch_size": batch_size
            }
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


@app.route('/api/retrain/status', methods=['GET'])
def get_training_status():
    # This endpoint would typically retrieve the status from a database or file
    # For demonstration purposes, we'll return a mock status
    if os.path.exists('training_status.json'):
        try:
            with open('training_status.json', 'r') as f:
                status = json.load(f)
                return jsonify(status)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({
            "active": False,
            "progress": 0,
            "current_epoch": 0,
            "total_epochs": 0,
            "current_loss": 0.0,
            "completed": False,
            "start_time": None,
            "end_time": None
        })