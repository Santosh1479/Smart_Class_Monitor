import cv2
import dlib
from imutils import face_utils
import numpy as np
from scipy.spatial import distance as dist
from gaze_tracking import GazeTracking

def eye_aspect_ratio(eye):
    """Calculate the Eye Aspect Ratio (EAR)."""
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    ear = (A + B) / (2.0 * C)
    return ear

def process_video(video_path):
    """Process a video file to detect drowsiness and gaze."""
    # Thresholds and constants
    EYE_AR_THRESH = 0.3
    EYE_AR_CONSEC_FRAMES = 48
    COUNTER = 0

    # Initialize dlib's face detector and facial landmarks predictor
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')
    (lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
    (rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]

    # Initialize gaze tracking
    gaze = GazeTracking()

    # Open the video file
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {"status": "error", "message": "Unable to open video file."}

    results = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Resize and convert to grayscale
        frame = cv2.resize(frame, (640, 480))
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Detect faces
        rects = detector(gray, 0)

        for rect in rects:
            # Get facial landmarks
            shape = predictor(gray, rect)
            shape = face_utils.shape_to_np(shape)

            # Calculate EAR for both eyes
            leftEye = shape[lStart:lEnd]
            rightEye = shape[rStart:rEnd]
            leftEAR = eye_aspect_ratio(leftEye)
            rightEAR = eye_aspect_ratio(rightEye)
            ear = (leftEAR + rightEAR) / 2.0

            # Check for drowsiness
            if ear < EYE_AR_THRESH:
                COUNTER += 1
                if COUNTER >= EYE_AR_CONSEC_FRAMES:
                    results.append("bored")
            else:
                COUNTER = 0

            # Gaze detection
            gaze.refresh(frame)
            if gaze.is_right():
                results.append("looking away")
            elif gaze.is_left():
                results.append("looking away")
            elif gaze.is_center():
                results.append("attentive")
            else:
                results.append("confused")

        # Break the loop if 'q' is pressed (for debugging purposes)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    # Return the most frequent result
    if results:
        final_result = max(set(results), key=results.count)
        return {"status": "success", "result": final_result}
    else:
        return {"status": "error", "message": "No faces detected in the video."}