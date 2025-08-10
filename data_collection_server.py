from flask import Flask, request, jsonify
from flask_cors import CORS
import os, json
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Use script-relative path handling
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / 'research_data'
DATA_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5 MB max

# Set allowed origins after you know your Pages URL.
# For first run/test, you can leave as "*" (less secure).
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*")
allowed = [o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()]

CORS(app, resources={r"/*": {"origins": allowed}},
     supports_credentials=False,
     allow_headers=["Content-Type"],
     methods=["GET", "POST", "OPTIONS"])

@app.after_request
def add_cors_headers(resp):
    origin = request.headers.get('Origin', '')
    # Allow all during tunnel testing; tighten later if you prefer
    resp.headers['Access-Control-Allow-Origin'] = origin or '*'
    resp.headers['Vary'] = 'Origin'
    resp.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    resp.headers['Access-Control-Allow-Credentials'] = 'true'
    return resp

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found", 
        "success": False, 
        "timestamp": datetime.now(timezone.utc).isoformat()
    }), 404

@app.route("/submit", methods=["OPTIONS"])
def submit_options():
    return ('', 204)

@app.route("/submit", methods=["POST"])
def submit():
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    meta = {
        "received_at": datetime.now(timezone.utc).isoformat(),
        "client_ip": request.headers.get("CF-Connecting-IP", request.remote_addr),
        "user_agent": request.headers.get("User-Agent", ""),
    }

    record = {
        "meta": meta,
        "data": payload
    }

    timestamp = datetime.utcnow().strftime('%Y%m%dT%H%M%S')
    file_id = uuid.uuid4().hex
    out_path = DATA_DIR / f"{timestamp}_{file_id}.json"

    try:
        with out_path.open('w', encoding='utf-8') as f:
            json.dump(record, f, ensure_ascii=False, indent=2)
    except Exception as e:
        return jsonify({"error": f"Failed to save data: {e}"}), 500

    return jsonify({"status": "ok", "id": f"{timestamp}_{file_id}.json"}), 200

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))  # Data collection server port
    print("🚀 Starting Flask server for research data collection...")
    print(f"📁 Data will be saved to: {DATA_DIR}")
    app.run(host="127.0.0.1", port=port, debug=True)