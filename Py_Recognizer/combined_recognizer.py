import cv2
import mediapipe as mp
import numpy as np
import face_recognition
import pickle

# ---------- SETTINGS ----------
EAR_THRESH = 0.25
EAR_CONSEC_FRAMES = 15
GAZE_THRESH = 0.35

LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [263, 387, 385, 362, 380, 373]

# ---------- MEDIA PIPE SETUP ----------
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

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

def analyze_image(frame, loaded_model):
    h, w = frame.shape[:2]
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # --- Face Recognition ---
    small_rgb = cv2.resize(rgb, (0, 0), fx=0.25, fy=0.25)
    boxes = face_recognition.face_locations(small_rgb, model="hog")
    encodings = face_recognition.face_encodings(small_rgb, boxes)

    face_labels = []
    face_boxes = []
    for enc, box in zip(encodings, boxes):
        try:
            name = loaded_model.predict([enc])[0]
        except Exception:
            name = "Unknown"
        top, right, bottom, left = [v * 4 for v in box]
        face_labels.append(name)
        face_boxes.append([left, top, right, bottom])

    # --- Drowsiness + Gaze via MediaPipe ---
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(
        max_num_faces=10,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    results = face_mesh.process(rgb)
    attention_data = []

    if results.multi_face_landmarks:
        for i, face_landmarks in enumerate(results.multi_face_landmarks):
            landmarks = face_landmarks.landmark
            ear_left = eye_aspect_ratio(landmarks, LEFT_EYE)
            ear_right = eye_aspect_ratio(landmarks, RIGHT_EYE)
            ear = (ear_left + ear_right) / 2.0

            drowsy = ear < EAR_THRESH
            gaze = gaze_status(landmarks, LEFT_EYE, RIGHT_EYE)

            xs = [lm.x for lm in landmarks]
            ys = [lm.y for lm in landmarks]
            x1, y1 = int(min(xs) * w), int(min(ys) * h)
            x2, y2 = int(max(xs) * w), int(max(ys) * h)

            attention_data.append({
                "bbox": [x1, y1, x2, y2],
                "drowsy": drowsy,
                "gaze": gaze
            })

    # --- Merge Face Recognition + Attention ---
    output = []
    for idx, bbox in enumerate(face_boxes):
        output.append({
            "id": str(face_labels[idx]) if idx < len(face_labels) else "Unknown",
            "bbox": [int(x) for x in bbox],
            "drowsy": bool(attention_data[idx]["drowsy"]) if idx < len(attention_data) else False,
            "gaze": str(attention_data[idx]["gaze"]) if idx < len(attention_data) else "Unknown"
        })

    return output

def main(class_name):
    # 1. Load face recognition model for the class
    model_path = f"Py_Recognizer/models/{class_name}_model.pkl"
    with open(model_path, "rb") as f:
        clf = pickle.load(f)

    cap = cv2.VideoCapture(0)
    ear_counter = 0

    print(f"[INFO] Starting combined detection for {class_name}. Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        output = analyze_image(frame, clf)

        for data in output:
            bbox = data["bbox"]
            label = data["id"]
            if data["drowsy"]:
                label += " | Drowsy"
            label += f" | {data['gaze']}"
            cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
            cv2.putText(frame, label, (bbox[0], bbox[1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        cv2.imshow("Combined Recognition & Gaze", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    class_name = input("Enter class name to recognize: ")
    main(class_name)