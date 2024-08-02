from PIL import Image
from credentials import load_creds

import google.generativeai as genai
import json
import os


creds = load_creds()

genai.configure(credentials=creds)


# genai.configure(api_key = os.getenv('API_KEY'))

model = genai.GenerativeModel(model_name = 'tunedModels/ecomodel-r7bhi6mqsrza')

response = model.generate_content([Image.open('test.png')])

print(response.text)

# for m in genai.list_tuned_models():
#     print(m.name)

# model = genai.GenerativeModel('tunedModels/ecomatchimage-jm0eczn7d193')
# image = Image.open('test.png')

# prompt = '''
# The following image was the input to two models. Both models outputted a recommendation.

# Here are the two recommendations:
# 1. Eat more carrots
# 2. Eat fewer carrots

# Select the better recommendation and provide an explanation why. Output your result in JSON 
# format and do not include any extra text.

# Example Output:
# {
#     "better_output": 1,
#     "reason": "Output 1 was more relevant"
# }
# '''

# response = model.generate_content([prompt, image])
# response.resolve()

# print(response.text)
# print(json.loads(response.text))
