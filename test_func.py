from firebase_functions import firestore_fn, https_fn
from firebase_admin import initialize_app, firestore
from utils import run_model

import google.cloud.firestore

# app = initialize_app()

@https_fn.on_request()
def invoke_model(req: https_fn.Request) -> https_fn.Response:
    input_text = req.args.get('input_text')
    model_output = run_model(input_text)

    return https_fn.Response(model_output)