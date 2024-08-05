# Eco Match App

## Overview

The Eco Match App is a Flask-based web application designed to help users visualize and plan their furnishing ideas. The app allows users to generate images based on descriptions, find similar IKEA products, and compare descriptions for a seamless home decor experience.

## Folder Structure

- **eco-match-app/**: Root directory of the application.
  - **shared/**: Contains shared resources and scripts used by the main application.
    - **all_urls.json**: JSON file containing a list of all URLs.
    - **configure.py**: Configuration script.
    - **image_desc_list.json**: JSON file with descriptions of IKEA images.
    - **image_generator.py**: Script to generate images using the OpenAI API.
    - **image_processor.py**: Script for processing images.
    - **test_text.txt**: Test text file.
  - **static/**: Contains static assets like CSS and JavaScript files.
  - **templates/**: Contains HTML templates.
    - **index.html**: The main HTML template for the application.
  - **.env**: Environment file containing sensitive information like API keys.
  - **app.py**: The main Flask application script.
  - **README.md**: Documentation file.
  - **requirements.txt**: List of Python dependencies for the project.

## Setup

### Prerequisites

- Python 3.x
- Flask
- Requests
- scikit-learn
- python-dotenv
- OpenAI API key