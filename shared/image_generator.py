from openai import OpenAI
from IPython.display import Image, display
from dotenv import load_dotenv
import os
import json

load_dotenv()
OPENAI_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI()

def image_generator(prompt):
    response = client.images.generate(
    model="dall-e-2",
    prompt=prompt,
    size="256x256",
    quality="standard",
    n=1,
    )
    image_url = response.data[0].url
    return image_url
