import cv2
import face_recognition
import pickle

def recognize_class(class_name):
    model_path = f"Py_Recognizer/models/{class_name}_model.pkl"
    with open(model_path, "rb") as f:
        clf = pickle.load(f)

    cap = cv2.VideoCapture(0)
    print(f"[INFO] Starting recognition for {class_name}. Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        small_rgb = cv2.resize(rgb, (0, 0), fx=0.25, fy=0.25)

        boxes = face_recognition.face_locations(small_rgb, model="hog")
        encodings = face_recognition.face_encodings(small_rgb, boxes)

        for (box, enc) in zip(boxes, encodings):
            name = clf.predict([enc])[0]

            # Scale back box to original size
            top, right, bottom, left = [v * 4 for v in box]
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(frame, name, (left, top - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        cv2.imshow("Recognition", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    class_name = input("Enter class name to recognize: ")
    recognize_class(class_name)
