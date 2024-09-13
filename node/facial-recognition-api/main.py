#!/usr/bin/env python3
from deepface import DeepFace
import os
import sys
import time

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Set a custom threshold for the distance metric (default is 0.4 for cosine distance)
custom_threshold = 0.8  # Increase the threshold to make passing easier

def get_script_path():
    return os.path.dirname(os.path.realpath(sys.argv[0]))

img1_path = get_script_path() + "/uploads/img1.jpg"
img2_path = get_script_path() + "/uploads/img2.jpg"

# Perform face verification with custom threshold
result = DeepFace.verify(
    img1_path, 
    img2_path, 
    model_name="VGG-Face", 
    detector_backend="opencv", 
    distance_metric="cosine", 
    enforce_detection=True, 
    align=True, 
    normalization="base"
)

# Get the distance from the result
distance = result['distance']

# Manually check if the distance is less than the custom threshold
if distance < custom_threshold:
    verified = True
else:
    verified = False

print(verified)

