from flask import Flask, render_template, request, jsonify
import os
import json
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
from shared.image_generator import image_generator

load_dotenv()
OPENAI_KEY = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)

# Load the JSON file and assign it to ikea_image_list
with open('shared/image_desc_list.json', 'r') as file:
    ikea_image_list = json.load(file)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compare', methods=['POST'])
def compare():
    generated_description = request.json['description']
    
    # Combine generated description with IKEA descriptions
    descriptions = [generated_description] + [item['image_desc'] for item in ikea_image_list]

    # Vectorize descriptions using TF-IDF
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(descriptions)

    # Calculate cosine similarities
    cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    # Combine URLs with their corresponding similarities
    similarities = [(ikea_image_list[i]['image_url'], 100 * cosine_similarities[i]) for i in range(len(cosine_similarities))]
    # Sort similarities in descending order
    similarities.sort(key=lambda x: x[1], reverse=True)

    # Return the most similar descriptions
    return jsonify(similarities)

@app.route('/generate_image', methods=['POST'])
def generate_image():
    prompt = request.json['prompt']
    image_url = image_generator(prompt)
    return jsonify({'image_url': image_url})

if __name__ == '__main__':
    app.run(debug=True)
