import json
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai
from flask import Flask, jsonify, request, send_file, send_from_directory

API_KEY = 'Gemini-Api-Key'
genai.configure(api_key=API_KEY)

app = Flask(__name__, static_folder='static')

# Load the JSON file and assign it to web_image_list
with open('shared/image_desc_list.json', 'r') as file:
    web_image_list = json.load(file)

# Load the sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Pre-compute embeddings for all image descriptions
image_embeddings = model.encode([item['image_desc'] for item in web_image_list])

@app.route("/")
def index():
    return send_file('templates/index.html')

@app.route("/api/generate", methods=["POST"])
def generate_api():
    if request.method == "POST":
        try:
            req_body = request.get_json()
            content = req_body.get("contents")
            model = genai.GenerativeModel(model_name=req_body.get("model"))
            response = model.generate_content(content, stream=True)
            def stream():
                for chunk in response:
                    yield 'data: %s\n\n' % json.dumps({ "text": chunk.text })

            return stream(), {'Content-Type': 'text/event-stream'}

        except Exception as e:
            return jsonify({ "error": str(e) })

@app.route('/compare', methods=['POST'])
def compare():
    generated_description = request.json['description']
    
    # Convert generated description to embedding
    gen_embedding = model.encode([generated_description])[0]

    # Calculate cosine similarities
    similarities = cosine_similarity([gen_embedding], image_embeddings)[0]

    # Combine URLs with their corresponding similarities
    similarity_scores = [(web_image_list[i]['image_url'], float(100 * similarities[i])) for i in range(len(similarities))]

    # Sort similarities in descending order
    similarity_scores.sort(key=lambda x: x[1], reverse=True)

    # Get only the top 3 similarities
    top_similarities = similarity_scores[:3]

    # Return the most similar info
    return jsonify(top_similarities)
    
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == "__main__":
    app.run(port=5000, debug=True)