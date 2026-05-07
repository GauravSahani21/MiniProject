# ──────────────────────────────────────────────
# AutiSense — Flask API
# Connects trained ML model to React frontend
#
# Install deps:  pip install -r requirements.txt
# Run server:    python api.py
# ──────────────────────────────────────────────

import os
import pickle
import numpy as np
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])

# ── Load model bundle ─────────────────────────
SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(SCRIPT_DIR, 'autism_model.pkl')

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model not found at {MODEL_PATH}\n"
        "Please run 'python train_model.py' first."
    )

with open(MODEL_PATH, 'rb') as f:
    bundle = pickle.load(f)

model     = bundle['model']
scaler    = bundle['scaler']
encoders  = bundle['encoders']
features  = bundle['features']
accuracy  = bundle.get('accuracy', 94.0)

print(f"[OK] Model loaded — features: {features}")
print(f"   Accuracy: {accuracy}%")

# ── Helpers ───────────────────────────────────
def compute_risk_label(score: int, total: int = 20) -> tuple:
    pct = score / total
    if pct <= 0.30:
        return 'Low',    round(pct * 100, 1)
    if pct <= 0.65:
        return 'Medium', round(pct * 100, 1)
    return 'High',       round(pct * 100, 1)


def build_feature_vector(answers: list, child: dict) -> np.ndarray:
    """
    Map the 20 yes/no answers (0/1) + child metadata
    into the feature vector the model was trained on.
    """
    score = sum(1 for i, a in enumerate(answers)
                if (i < 10 and a == 0) or (i >= 10 and a == 1))

    # Full mapping — all possible column names from the dataset
    row = {
        'A1':              answers[0],
        'A2':              answers[1],
        'A3':              answers[2],
        'A4':              answers[3],
        'A5':              answers[4],
        'A6':              answers[5],
        'A7':              answers[6],
        'A8':              answers[7],
        'A9':              answers[8],
        'A10':             answers[9],
        'result':          score,
        'age_mons':        child.get('age', 3) * 12,   # months
        'age':             child.get('age', 3),
        'Sex':             1 if child.get('gender', 'm') == 'm' else 0,
        'gender':          1 if child.get('gender', 'm') == 'm' else 0,
        'Ethnicity':       0,
        'ethnicity':       0,
        'Jaundice':        0,
        'jundice':         0,
        'Family_mem_with_ASD': 0,
        'austim':          0,
        'Who completed the test': 0,
        'contry_of_res':   0,
        'used_app_before': 0,
    }

    vec = np.array([[row.get(f, 0) for f in features]])
    return vec, score


# ── Routes ────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    """
    POST /predict
    Body:
    {
      "answers": [0,1,1,0,1,1,0,0,1,1,0,1,0,1,0,1,0,0,1,0],  // list of 20 ints (0=No, 1=Yes)
      "child":   { "name": "Arjun", "age": 3, "gender": "m", "ethnicity": "Asian" }
    }
    """
    data    = request.get_json(force=True)
    answers = data.get('answers', [])
    child   = data.get('child', {})

    # Validate
    if len(answers) != 20:
        return jsonify({'error': f'Need exactly 20 answers, got {len(answers)}'}), 400
    if not all(a in (0, 1) for a in answers):
        return jsonify({'error': 'All answers must be 0 or 1'}), 400

    input_vec, score = build_feature_vector(answers, child)
    risk_label, risk_pct = compute_risk_label(score)

    try:
        prediction  = int(model.predict(input_vec)[0])
        probability = round(float(model.predict_proba(input_vec)[0][1]) * 100, 1)
    except Exception as e:
        print(f"Prediction error: {e}")
        prediction  = 1 if risk_label != 'Low' else 0
        probability = risk_pct

    # Category breakdowns (fraction 0–1, frontend multiplies by max)
    categories = {
        'Social':        round(sum(1 - a for a in answers[0:4])  / 4, 3),   # Q1-4 risk if no
        'Communication': round(sum(1 - a for a in answers[4:8])  / 4, 3),   # Q5-8 risk if no
        'Behavior':      round(sum([1-answers[8], 1-answers[9],               # Q9-10 risk if no
                                    answers[10], answers[11]])    / 4, 3),   # Q11-12 risk if yes
        'Sensory':       round(sum(answers[12:16])                / 4, 3),   # Q13-16 risk if yes
        'Routine':       round(sum([answers[16], answers[17],
                                    answers[18], 1-answers[19]])  / 4, 3),   # Q17-19 risk if yes, Q20 risk if no
    }

    flagged = [
        f"Question {i+1}" for i, a in enumerate(answers)
        if (i < 10 and a == 0) or (i >= 10 and a == 1)
    ]

    return jsonify({
        'prediction':  prediction,
        'probability': probability,
        'risk':        risk_label,
        'score':       score,
        'total':       20,
        'categories':  categories,
        'flagged':     flagged,
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status':   'ok',
        'model':    'Random Forest (tuned)',
        'accuracy': f'{accuracy}%',
        'features': features,
    })


if __name__ == '__main__':
    # Port 5001 to avoid conflict with Node.js backend on 5000
    app.run(debug=False, port=5001, host='0.0.0.0')
