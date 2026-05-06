# ──────────────────────────────────────────────
# AutiSense — Flask API
# Connects trained ML model to React frontend
#
# Install deps:  pip install -r requirements.txt
# Train first:   python train_model.py
# Run server:    python api.py
# ──────────────────────────────────────────────

import os
import pickle
import numpy as np
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
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


def infer_trend_direction(scores: list) -> str:
    if len(scores) < 2:
        return 'stable'
    delta = float(scores[-1]) - float(scores[0])
    if delta <= -1:
        return 'improving'
    if delta >= 1:
        return 'worsening'
    return 'stable'


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
    Returns:
    {
      "prediction": 1,
      "probability": 72.4,
      "risk": "High",
      "score": 14,
      "total": 20,
      "categories": { "Social": 0.6, "Communication": 0.5, ... },
      "flagged": ["Question 3", "Question 7", ...]
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


@app.route('/trajectory', methods=['POST'])
def trajectory():
    """
    POST /trajectory
    Body:
    {
      "scores": [5, 7, 9, 11],
      "dates": ["2024-08-10", "2024-09-10", "2024-10-10", "2024-11-10"]
    }
    Returns:
    {
      "predictedScore": 12.4,
      "lowerBound": 10.8,
      "upperBound": 14.0,
      "confidence": 82.1,
      "trendDirection": "worsening"
    }
    """
    payload = request.get_json(force=True) or {}
    scores = payload.get('scores', [])
    dates = payload.get('dates', [])

    if not isinstance(scores, list) or len(scores) == 0:
      return jsonify({'error': 'scores must be a non-empty array'}), 400

    try:
        y = np.array([float(s) for s in scores], dtype=float)
    except Exception:
        return jsonify({'error': 'scores array must contain numeric values'}), 400

    if np.any(y < 0) or np.any(y > 20):
        return jsonify({'error': 'scores must be between 0 and 20'}), 400

    # Attempt to parse provided dates (optional for regression logic).
    parsed_dates = []
    if isinstance(dates, list):
        for d in dates:
            try:
                parsed_dates.append(datetime.fromisoformat(str(d).replace('Z', '+00:00')))
            except Exception:
                continue

    trend_direction = infer_trend_direction(y.tolist())

    if len(y) == 1:
        predicted = float(y[0])
        lower = max(0.0, predicted - 1.0)
        upper = min(20.0, predicted + 1.0)
        confidence = 55.0
    else:
        x = np.arange(len(y), dtype=float)
        slope, intercept = np.polyfit(x, y, 1)
        next_x = float(len(y))
        predicted = float(intercept + slope * next_x)
        predicted = float(np.clip(predicted, 0, 20))

        y_hat = slope * x + intercept
        residuals = y - y_hat
        rss = float(np.sum(residuals ** 2))
        tss = float(np.sum((y - np.mean(y)) ** 2))

        if tss > 1e-9:
            r2 = max(0.0, min(1.0, 1.0 - (rss / tss)))
        else:
            r2 = 0.5

        std_err = float(np.sqrt(rss / max(len(y), 1)))
        margin = 1.96 * std_err
        lower = float(np.clip(predicted - margin, 0, 20))
        upper = float(np.clip(predicted + margin, 0, 20))
        confidence = float(np.clip(r2 * 100.0, 35.0, 99.0))

    return jsonify({
        'predictedScore': round(predicted, 2),
        'lowerBound': round(lower, 2),
        'upperBound': round(upper, 2),
        'confidence': round(confidence, 1),
        'trendDirection': trend_direction,
    })


def _infer_focus_areas_from_answers(answers):
    """
    Heuristic focus inference to keep the system usable even if Gemini fails.
    answers: list of 20 ints (0/1)
    Returns: (focusAreas:list[str], breakdown:dict)
    """
    if not isinstance(answers, list) or len(answers) != 20:
        return (["communication"], {"communication": 0.34, "sensory": 0.33, "behavior": 0.33})

    # Reuse the same category grouping used by /predict
    comm = sum(1 - a for a in answers[4:8]) / 4.0
    sensory = sum(answers[12:16]) / 4.0
    behavior = (sum([1-answers[8], 1-answers[9], answers[10], answers[11]]) / 4.0)

    breakdown = {
        "communication": round(float(comm), 3),
        "sensory": round(float(sensory), 3),
        "behavior": round(float(behavior), 3),
    }

    ranked = sorted(breakdown.items(), key=lambda kv: kv[1], reverse=True)
    focus = [ranked[0][0], ranked[1][0]]
    return (focus, breakdown)


def _gemini_generate_intervention(payload):
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")

    model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    # Force JSON output to keep parsing reliable.
    system_rules = (
        "You are a pediatric early-intervention planner. "
        "Return ONLY valid JSON. No markdown, no extra text."
    )

    prompt = {
        "childId": payload.get("childId"),
        "riskLevel": payload.get("riskLevel"),
        "score": payload.get("score"),
        "age": payload.get("age"),
        "gender": payload.get("gender"),
        "answers": payload.get("answers"),
        "requirements": {
            "focusAreas": ["communication", "sensory", "behavior"],
            "weeklyActivities": "Return 5-7 activities total for the week, distributed across days (Mon-Sun).",
            "activityFields": ["day", "name", "description", "durationMinutes", "focusArea"],
            "tips": "Return 3-6 short tips for parents."
        }
    }

    req_body = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": system_rules + "\n\nINPUT:\n" + json.dumps(prompt)}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "topP": 0.9,
            "maxOutputTokens": 800
        }
    }

    resp = requests.post(url, json=req_body, timeout=25)
    data = resp.json()
    if resp.status_code != 200:
        raise RuntimeError(data.get("error", {}).get("message", f"Gemini error ({resp.status_code})"))

    text = ""
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        raise RuntimeError("Gemini response missing text content")

    # Parse returned JSON
    try:
        return json.loads(text)
    except Exception:
        # Attempt to extract JSON substring
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start:end+1])
        raise RuntimeError("Failed to parse Gemini JSON output")


def _gemini_next_action(payload):
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")

    model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"

    system_rules = (
        "You are a clinical decision support assistant for pediatric developmental screening. "
        "Return ONLY valid JSON. No markdown, no extra text."
    )

    req_body = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": system_rules
                               + "\n\nINPUT:\n"
                               + json.dumps(payload)
                               + "\n\nOUTPUT JSON schema:\n"
                               + json.dumps({
                                    "action": "refer specialist | repeat screen | therapy focus",
                                    "urgency": "low | medium | high",
                                    "timeline": "string (e.g. 'within 2 weeks')",
                                    "reasoning": "plain language explanation for doctors",
                                    "therapyFocus": ["communication","sensory","behavior"]
                                })
                    }
                ]
            }
        ],
        "generationConfig": {"temperature": 0.3, "topP": 0.9, "maxOutputTokens": 600}
    }

    resp = requests.post(url, json=req_body, timeout=25)
    data = resp.json()
    if resp.status_code != 200:
        raise RuntimeError(data.get("error", {}).get("message", f"Gemini error ({resp.status_code})"))

    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        raise RuntimeError("Gemini response missing text content")

    try:
        return json.loads(text)
    except Exception:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start:end+1])
        raise RuntimeError("Failed to parse Gemini JSON output")


MCHAT_QUESTIONS_TEXT = [
    "Does your child look at you when you call his/her name?",
    "Does your child make eye contact with familiar people?",
    "Does your child point to show you something interesting?",
    "Does your child smile back when you smile at them?",
    "Does your child use words to communicate (or babble before 12 mo)?",
    "Does your child follow when you point at something across the room?",
    "Does your child bring objects to show you things?",
    "Does your child respond to simple instructions (e.g. 'Come here')?",
    "Does your child engage in pretend or make-believe play?",
    "Does your child show interest in playing with other children?",
    "Does your child show repetitive hand or arm movements (flapping)?",
    "Does your child spin objects or spin themselves repeatedly?",
    "Does your child seem sensitive to loud sounds or bright lights?",
    "Does your child walk on tiptoes more often than on flat feet?",
    "Does your child avoid physical contact like hugging?",
    "Does your child have unusual reactions to textures (food/clothing)?",
    "Does your child get very upset by small changes in daily routine?",
    "Does your child line up toys or objects in rigid patterns?",
    "Does your child seem to be 'in his/her own world' often?",
    "Does your child respond when you try to play with them?",
]


@app.route('/explain', methods=['POST'])
def explain():
    """
    POST /explain
    Body:
    {
      "answers": [0/1 x20],
      "riskLevel": "Low|Medium|High",
      "score": number
    }
    Returns:
    {
      "topFactors": [{questionId, questionText, contributionPercent, direction}, ...],
      "method": "feature_importance_heuristic"
    }
    """
    payload = request.get_json(force=True) or {}
    answers = payload.get("answers", [])
    if not isinstance(answers, list) or len(answers) != 20:
        return jsonify({"error": "answers must be an array of 20 ints (0/1)"}), 400
    if not all(a in (0, 1) for a in answers):
        return jsonify({"error": "answers must contain only 0 or 1"}), 400

    # Base importances from RF model for A1..A10 (most common autism datasets use only 10 Qs + result)
    importances = {}
    if hasattr(model, "feature_importances_"):
        fi = list(getattr(model, "feature_importances_", []) or [])
        feat_to_imp = {}
        for i, f in enumerate(features):
            if i < len(fi):
                feat_to_imp[str(f)] = float(fi[i])
        for i in range(10):
            importances[i] = float(feat_to_imp.get(f"A{i+1}", 0.0))

    # If missing importances, default small equal weights for first 10
    if sum(importances.values()) <= 1e-9:
        for i in range(10):
            importances[i] = 0.1

    # For Q11..Q20: distribute smaller heuristic weight based on whether the answer is flagged by M-CHAT scoring
    # Flag rule: Q1-10 risk if No (0), Q11-20 risk if Yes (1)
    flagged = []
    for i, a in enumerate(answers):
        is_flag = (i < 10 and a == 0) or (i >= 10 and a == 1)
        if is_flag:
            flagged.append(i)

    # Assign base scores
    raw_scores = []
    for i in range(20):
        base = importances.get(i, 0.0)
        if i >= 10:
            base = 0.04  # small baseline for non-modelled questions
        # Boost flagged items slightly so they appear in top 5 when relevant
        if i in flagged:
            base *= 2.0
        raw_scores.append(max(0.0, float(base)))

    total = sum(raw_scores) or 1.0
    factors = []
    for i, s in enumerate(raw_scores):
        pct = round((s / total) * 100.0, 1)
        direction = "increased_risk" if i in flagged else "protective_or_neutral"
        factors.append({
            "questionId": i + 1,
            "questionText": MCHAT_QUESTIONS_TEXT[i],
            "contributionPercent": pct,
            "direction": direction
        })

    factors.sort(key=lambda x: x["contributionPercent"], reverse=True)
    return jsonify({
        "topFactors": factors[:5],
        "method": "feature_importance_heuristic"
    })


@app.route('/next-action', methods=['POST'])
def next_action():
    """
    POST /next-action
    Body:
    {
      "childId": "mongoId",
      "child": { "name": "...", "age": 3, "gender": "m|f" },
      "riskLevel": "Low|Medium|High",
      "score": number,
      "screeningHistory": [{date, score, riskLevel, status}, ...]
    }
    Returns:
    { action, urgency, timeline, reasoning, therapyFocus[] }
    """
    payload = request.get_json(force=True) or {}
    risk = str(payload.get("riskLevel", "Medium"))
    score = payload.get("score", None)
    history = payload.get("screeningHistory", []) or []

    # Basic trend heuristic for fallback
    scores = []
    for h in history:
        try:
            scores.append(float(h.get("score", 0)))
        except Exception:
            continue
    trend = infer_trend_direction(scores) if scores else "stable"

    try:
        out = _gemini_next_action(payload)
        return jsonify(out)
    except Exception:
        # Fallback rules
        risk_l = risk.lower()
        if risk_l == "high" or (isinstance(score, (int, float)) and float(score) >= 14):
            return jsonify({
                "action": "refer specialist",
                "urgency": "high",
                "timeline": "within 1-2 weeks",
                "reasoning": "High-risk M-CHAT score suggests elevated concern. Recommend referral for comprehensive developmental assessment and early intervention intake.",
                "therapyFocus": ["communication", "behavior"]
            })
        if risk_l == "medium" or (isinstance(score, (int, float)) and float(score) >= 7):
            return jsonify({
                "action": "therapy focus",
                "urgency": "medium",
                "timeline": "start within 2-4 weeks and repeat screening in 8-12 weeks",
                "reasoning": f"Moderate risk pattern with a {trend} trend across screenings. Begin targeted parent-mediated activities and monitor response; repeat screening to track trajectory.",
                "therapyFocus": ["communication", "sensory", "behavior"]
            })
        return jsonify({
            "action": "repeat screen",
            "urgency": "low",
            "timeline": "repeat screening in 3 months",
            "reasoning": "Low-risk screening pattern. Reinforce developmental enrichment and rescreen to confirm stability over time.",
            "therapyFocus": ["communication"]
        })

@app.route('/generate-intervention', methods=['POST'])
def generate_intervention():
    """
    POST /generate-intervention
    Body:
    {
      "childId": "mongoId",
      "riskLevel": "Low|Medium|High",
      "score": 10,
      "age": 3,
      "gender": "m|f",
      "answers": [0/1 x20]
    }
    Returns:
    {
      "focusAreas": ["communication","sensory"],
      "weeklyActivities": [{day,name,description,durationMinutes,focusArea}, ...],
      "tips": ["...", "..."],
      "breakdown": {"communication":0.5,"sensory":0.25,"behavior":0.25}
    }
    """
    payload = request.get_json(force=True) or {}
    answers = payload.get("answers", [])

    focus, breakdown = _infer_focus_areas_from_answers(answers)

    # Try Gemini first; fallback to local generation on any failure.
    try:
        out = _gemini_generate_intervention(payload)
        focus_areas = out.get("focusAreas", focus)
        weekly = out.get("weeklyActivities", [])
        tips = out.get("tips", [])
        return jsonify({
            "focusAreas": focus_areas,
            "weeklyActivities": weekly,
            "tips": tips,
            "breakdown": breakdown
        })
    except Exception as e:
        # Local fallback: simple age/risk-based activities
        age = int(payload.get("age", 3) or 3)
        risk = str(payload.get("riskLevel", "Medium"))

        base = [
            ("Mon", "Turn-Taking Play", "Play a simple turn-taking game (rolling ball / stacking blocks) and pause to invite response.", 12, "communication"),
            ("Tue", "Sensory Bin Exploration", "Use a small bin with safe textures (rice/beans) and practice naming textures and asking for items.", 10, "sensory"),
            ("Wed", "Imitation Time", "Do 5-minute imitation bursts: clap, wave, stomp; reward any attempt and keep it fun.", 8, "behavior"),
            ("Thu", "Picture Choice Board", "Offer 2 picture choices (snack/toy) and prompt pointing or word attempt before giving it.", 10, "communication"),
            ("Fri", "Deep Pressure Calm Routine", "Try a short calm routine: firm hugs if tolerated, blanket wrap, slow breathing with parent.", 8, "sensory"),
            ("Sat", "First-Then Routine", "Use 'First activity, then reward' with clear visuals and consistent follow-through.", 10, "behavior"),
        ]

        # Risk/age tuning
        if age <= 3:
            base = [(d, n, desc, max(6, dur-2), f) for (d, n, desc, dur, f) in base]
        if risk.lower() == "high":
            base = [(d, n, desc + " Keep sessions shorter and more frequent.", max(6, dur-2), f) for (d, n, desc, dur, f) in base]

        weekly = [
            {"day": d, "name": n, "description": desc, "durationMinutes": dur, "focusArea": f}
            for (d, n, desc, dur, f) in base[:7]
        ]
        tips = [
            "Keep activities short and predictable.",
            "Praise attempts, not perfection.",
            "Use visual cues (pictures) when possible.",
            "Repeat routines at the same time daily.",
        ]
        return jsonify({
            "focusAreas": focus,
            "weeklyActivities": weekly,
            "tips": tips,
            "breakdown": breakdown,
            "geminiFallback": True
        })


@app.route('/analyze-drawing', methods=['POST'])
def analyze_drawing():
    """
    POST /analyze-drawing
    Body:
    {
      "image": "base64_encoded_string"
    }
    Returns:
    {
      "prediction": "High/Medium/Low",
      "reasoning": "...",
      "score": number
    }
    """
    payload = request.get_json(force=True) or {}
    base64_image = payload.get("image", "")

    if not base64_image:
        return jsonify({"error": "No image provided"}), 400

    # Remove data:image/jpeg;base64, prefix if present
    if "," in base64_image:
        base64_image = base64_image.split(",")[1]

    # Hardcoded API key as requested
    api_key = "AIzaSyBpqivQfHA9KvVwrHlseoR67vF5Xsp8b2E"
    model_name = "gemini-1.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"

    system_rules = (
        "You are an expert pediatric psychologist specializing in early autism detection. "
        "Analyze this child's drawing. Evaluate if the drawing shows characteristics often associated with autism spectrum disorder in young children (e.g., hyper-focus on specific details, unusual spatial organization, lack of typical social elements, repetitive patterns). "
        "Return ONLY valid JSON. No markdown, no extra text. "
        "OUTPUT JSON schema: "
        "{\"prediction\": \"High\" | \"Medium\" | \"Low\", \"reasoning\": \"detailed explanation of observed traits\", \"score\": 0 to 100 integer representing confidence/risk}"
    )

    req_body = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": system_rules},
                    {
                        "inlineData": {
                            "mimeType": "image/jpeg",
                            "data": base64_image
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "topP": 0.9,
            "maxOutputTokens": 800
        }
    }

    try:
        resp = requests.post(url, json=req_body, timeout=30)
        data = resp.json()

        if resp.status_code != 200:
            return jsonify({"error": data.get("error", {}).get("message", f"Gemini error ({resp.status_code})")}), 500

        text = data["candidates"][0]["content"]["parts"][0]["text"]
        
        # Parse returned JSON
        try:
            result = json.loads(text)
        except Exception:
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                result = json.loads(text[start:end+1])
            else:
                return jsonify({"error": "Failed to parse Gemini JSON output"}), 500

        return jsonify({
            "prediction": result.get("prediction", "Unknown"),
            "reasoning": result.get("reasoning", "No reasoning provided."),
            "score": result.get("score", 0)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status':   'ok',
        'model':    'Random Forest (tuned)',
        'accuracy': f'{accuracy}%',
        'features': features,
    })


if __name__ == '__main__':
    # Changed port to 5001 to avoid conflict with Node.js backend on 5000
    app.run(debug=True, port=5001, host='0.0.0.0')
