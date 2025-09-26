import cv2
import mediapipe as mp
import numpy as np

# ---------- SETTINGS ----------
EAR_THRESH = 0.25          # Threshold for eyes closed
EAR_CONSEC_FRAMES = 15     # Frames eyes closed → drowsy
GAZE_THRESH = 0.35         # Approx threshold for looking away

# ---------- MEDIA PIPE SETUP ----------
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,   # iris landmarks included
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# ---------- HELPER FUNCTIONS ----------
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
    # Approx horizontal gaze
    left = np.mean([landmarks[i].x for i in left_eye_indices])
    right = np.mean([landmarks[i].x for i in right_eye_indices])
    gaze_lr = (left + right) / 2.0 - 0.5  # -0.5 left, +0.5 right
    if gaze_lr < -GAZE_THRESH:
        return "Looking Left"
    elif gaze_lr > GAZE_THRESH:
        return "Looking Right"
    else:
        return "Looking Forward"

# Eye indices from MediaPipe Face Mesh (example)
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [263, 387, 385, 362, 380, 373]

# ---------- CAMERA LOOP ----------
cap = cv2.VideoCapture(0)
ear_counter = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break
    h, w = frame.shape[:2]
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            landmarks = face_landmarks.landmark

            # EAR → Drowsiness
            ear_left = eye_aspect_ratio(landmarks, LEFT_EYE)
            ear_right = eye_aspect_ratio(landmarks, RIGHT_EYE)
            ear = (ear_left + ear_right) / 2.0

            drowsy = False
            if ear < EAR_THRESH:
                ear_counter += 1
            else:
                ear_counter = 0
            if ear_counter >= EAR_CONSEC_FRAMES:
                drowsy = True

            # Gaze estimation
            gaze = gaze_status(landmarks, LEFT_EYE, RIGHT_EYE)

            # Draw rectangle around face
            # Using min/max landmarks to approximate bounding box
            xs = [lm.x for lm in landmarks]
            ys = [lm.y for lm in landmarks]
            x1, y1 = int(min(xs) * w), int(min(ys) * h)
            x2, y2 = int(max(xs) * w), int(max(ys) * h)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0,255,0), 2)

            # Display labels
            label = gaze
            if drowsy:
                label += " | Drowsy"
            cv2.putText(frame, label, (x1, y1-10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,255), 2)

    cv2.imshow("Action Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
