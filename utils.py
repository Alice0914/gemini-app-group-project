from PIL import Image

import google.generativeai as genai
import json
import os


genai.configure(api_key = os.getenv('API_KEY'))


def run_model(prompt, model_name = 'gemini-1.5-flash'):
    model = genai.GenerativeModel(model_name)
    response = model.generate_content(prompt)

    return response.text
