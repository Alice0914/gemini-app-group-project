import pandas as pd
import os
import requests

def download_image(image_url, save_folder='images'):
    # # Example usage
    # image_url = 'https://www.ikea.com/global/assets/range-categorisation/images/dining-sets-19145.jpeg?imwidth=300'
    # download_image(image_url)

    if not os.path.exists(save_folder):
        os.makedirs(save_folder)
    
    response = requests.get(image_url)
    if response.status_code == 200:
        image_name = os.path.basename(image_url).split('?')[0]
        image_path = os.path.join(save_folder, image_name)
        
        with open(image_path, 'wb') as file:
            file.write(response.content)
        # print(f"Image downloaded and saved as {image_path}")
    else:
        print(f"Failed to download image. Status code: {response.status_code}")

