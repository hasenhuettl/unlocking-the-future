#!/usr/bin/env python3
from deepface import DeepFace
import os
import sys

def get_script_path():
    return os.path.dirname(os.path.realpath(sys.argv[0]))

img1_path = get_script_path() + "/uploads/img1.jpg"
img2_path = get_script_path() + "/uploads/img2.jpg"

#verification = DeepFace.verify(img1_path = img1_path, img2_path = img2_path)
result = DeepFace.verify(img1_path, img2_path, model_name="VGG-Face", detector_backend="opencv", distance_metric="cosine", enforce_detection=True, align=True, normalization="base")

f = open("result.txt", "w")

verified = str(result['verified'])

f.write(verified)
f.close()

print(verified)
