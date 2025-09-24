from scipy.spatial import distance as dist
from imutils import face_utils
import dlib
import cv2
import imutils
import time

def eye_aspect_ratio(eye):
    """Calculate the Eye Aspect Ratio (EAR)."""
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    ear = (A + B) / (2.0 * C)
    return ear

def detect_drowsy(video_source=0):
    """
    Detect drowsiness from a video source (webcam or video file).
    
    Args:
        video_source (int or str): 0 for webcam, or path to a video file.
    
    Returns:
        str: "drowsy" if drowsiness is detected, "alert" otherwise.
    """
    # Thresholds and constants
    EYE_AR_THRESH = 0.3
    EYE_AR_CONSEC_FRAMES = 48
    COUNTER = 0

    # Initialize dlib's face detector and facial landmarks predictor
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks.dat')
    (lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
    (rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]

    # Open the video source
    cap = cv2.VideoCapture(video_source)
    if not cap.isOpened():
        return {"status": "error", "message": "Unable to open video source."}

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Resize and convert to grayscale
        frame = imutils.resize(frame, width=450)
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
                    cap.release()
                    cv2.destroyAllWindows()
                    return {"status": "success", "result": "drowsy"}
            else:
                COUNTER = 0

        # Break the loop if 'q' is pressed (for debugging purposes)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return {"status": "success", "result": "alert"}