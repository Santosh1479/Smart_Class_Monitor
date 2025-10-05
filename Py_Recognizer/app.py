from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
import face_recognition
import pickle
import mediapipe as mp
from combined_recognizer import analyze_image
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# --- Globals ---
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
loaded_model = None
current_class = None
ear_counter = {}  # dict to track EAR per face

# --- MediaPipe ---
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=10,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# --- EAR / Gaze helpers ---
EAR_THRESH = 0.25
EAR_CONSEC_FRAMES = 15
GAZE_THRESH = 0.35
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [263, 387, 385, 362, 380, 373]

def eye_aspect_ratio(landmarks, eye_indices):
    p1 = np.array([landmarks[eye_indices[1]].x, landmarks[eye_indices[1]].y])
    p2 = np.array([landmarks[eye_indices[5]].x, landmarks[eye_indices[5]].y])
    p3 = np.array([landmarks[eye_indices[2]].x, landmarks[eye_indices[2]].y])
    p4 = np.array([landmarks[eye_indices[4]].x, landmarks[eye_indices[4]].y])
    p_left = np.array([landmarks[eye_indices[0]].x, landmarks[eye_indices[0]].y])
    p_right = np.array([landmarks[eye_indices[3]].x, landmarks[eye_indices[3]].y])
    A = np.linalg.norm(p2 - p1)
    B = np.linalg.norm(p4 - p3)
    C = np.linalg.norm(p_right - p_left)
    ear = (A + B) / (2.0 * C + 1e-6)
    return ear

def gaze_status(landmarks, left_eye_indices, right_eye_indices):
    left = np.mean([landmarks[i].x for i in left_eye_indices])
    right = np.mean([landmarks[i].x for i in right_eye_indices])
    gaze_lr = (left + right) / 2.0 - 0.5
    if gaze_lr < -GAZE_THRESH:
        return "Looking Left"
    elif gaze_lr > GAZE_THRESH:
        return "Looking Right"
    else:
        return "Looking Forward"

# --- Load model for class ---
@app.route("/class/<class_name>", methods=["GET"])
def load_class_model(class_name):
    global loaded_model, current_class
    model_path = os.path.join(MODEL_DIR, f"{class_name}_model.pkl")
    dataset_path = os.path.join(BASE_DIR, "dataset", class_name)
    try:
        with open(model_path, "rb") as f:
            loaded_model = pickle.load(f)
        current_class = class_name

        # Get all student folder names (USNs)
        if os.path.exists(dataset_path):
            students = [
                name for name in os.listdir(dataset_path)
                if os.path.isdir(os.path.join(dataset_path, name))
            ]
        else:
            students = []

        return jsonify({
            "status": "success",
            "message": f"Loaded model for {class_name}",
            "students": students
        })
    except FileNotFoundError:
        return jsonify({"error": f"Model for class '{class_name}' not found"}), 404

# --- Predict ---
@app.route("/predict", methods=["POST"])
def predict():
    global loaded_model, current_class, ear_counter
    try:
        if loaded_model is None:
            return jsonify({"error": "No class model loaded. Call /class/<classname> first."}), 400

        # Parse JSON
        data = request.get_json(force=True, silent=True)
        if not data or "image" not in data:
            return jsonify({"error": "Missing 'image' in request body"}), 400

        print("Received data keys:", data.keys())
        print("Image length:", len(data["image"]) if "image" in data else "NO IMAGE")

        # Decode image
        img_data = data["image"].split(",")[-1]  # strip data:image/jpeg;base64, if present
        img_bytes = base64.b64decode(img_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return jsonify({"error": "Failed to decode image"}), 400

        cv2.imwrite("received.jpg", frame)
        print("Saved received image for debug.")

        output = analyze_image(frame, loaded_model)
        return jsonify({"class": current_class, "faces": output})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    import os
    os.makedirs(MODEL_DIR, exist_ok=True)
    app.run(host="0.0.0.0", port=5000, debug=True)
