#!/usr/bin/env python3
from flask import Flask, request, jsonify
import librosa
import numpy as np
from sklearn.mixture import GaussianMixture
import os
import pickle
from pydub import AudioSegment
from pydub.exceptions import CouldntDecodeError

app = Flask(__name__)

MODEL_DIR = 'models'
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def convert_to_wav(file_path):
    try:
        sound = AudioSegment.from_file(file_path)
        wav_path = file_path.replace('.ogg', '.wav').replace('.mp3', '.wav')
        sound.export(wav_path, format='wav')
        return wav_path
    except CouldntDecodeError:
        raise ValueError("Could not decode audio file. Please provide a valid audio file.")

def extract_features(file_path):
    wav_path = convert_to_wav(file_path)
    try:
        y, sr = librosa.load(wav_path, sr=None)
        #mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        #return np.mean(mfcc.T, axis=0)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_mean = np.mean(mfcc.T, axis=0)
        mfcc_var = np.var(mfcc.T, axis=0)
        features = np.hstack((mfcc_mean, mfcc_var))
        return features
    except Exception as e:
        raise ValueError(f"Failed to extract features from the audio file: {str(e)}")

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        file_path = data['filePath']
        user_id = data['userId']

        if not os.path.exists(file_path):
            return jsonify({"message": "Audio file not found"}), 400

        features = extract_features(file_path).reshape(-1, 1)
        
        n_components = features.shape[0]
        if n_components < 16:
            return jsonify({"message": "Insufficient audio data to train model"}), 400

        model = GaussianMixture(n_components=3)

        try:
            model.fit(features)
        except ValueError as e:
            return jsonify({"message": f"Model fitting failed: {str(e)}"}), 400

        model_path = os.path.join(MODEL_DIR, f"{user_id}.pkl")
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)

        return jsonify({"message": "Signup successful"}), 200

    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        file_path = data['filePath']
        user_id = data['userId']

        if not os.path.exists(file_path):
            return jsonify({"message": "Audio file not found"}), 400

        features = extract_features(file_path).reshape(-1, 1)

        model_path = os.path.join(MODEL_DIR, f"{user_id}.pkl")
        if not os.path.exists(model_path):
            return jsonify({"message": "User not found"}), 404

        with open(model_path, 'rb') as f:
            model = pickle.load(f)

        # Check if the model has been fitted
        if not hasattr(model, 'means_'):
            return jsonify({"message": "The model is not properly trained"}), 500

        score = model.score(features)

        if score > -50: # Adjust threshold according to tests
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"message": "Login failed, Score: " + str(score) + " out of -50"}), 401

    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": f"An unexpected error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=5000)

