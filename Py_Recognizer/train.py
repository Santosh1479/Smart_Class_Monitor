import os
import pickle
import face_recognition
import cv2
from sklearn.svm import SVC

dataset_path = "C:\\Users\\Santosh\\OneDrive\\Desktop\\Smart_Class_Monitor\\Py_Recognizer\\dataset"
model_dir = "C:\\Users\\Santosh\\OneDrive\\Desktop\\Smart_Class_Monitor\\Py_Recognizer\\models"
os.makedirs(model_dir, exist_ok=True)

def train_class(class_name):
    class_path = os.path.join(dataset_path, class_name)
    if not os.path.isdir(class_path):
        print(f"[ERROR] Class {class_name} not found in dataset.")
        return

    X, y = [], []
    print(f"[INFO] Training model for {class_name}...")

    for student in os.listdir(class_path):
        student_folder = os.path.join(class_path, student)
        if not os.path.isdir(student_folder):
            continue

        for img_name in os.listdir(student_folder):
            img_path = os.path.join(student_folder, img_name)
            image = cv2.imread(img_path)
            if image is None:
                continue

            # Resize for faster processing
            rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            small_rgb = cv2.resize(rgb, (0, 0), fx=0.25, fy=0.25)

            boxes = face_recognition.face_locations(small_rgb, model="hog")
            encodings = face_recognition.face_encodings(small_rgb, boxes)

            for enc in encodings:
                X.append(enc)
                y.append(student)

    # Check if at least 2 students exist
    if len(set(y)) < 2:
        print(f"[WARN] Only one student found in {class_name}. Need at least 2 for training.")
        return

    clf = SVC(kernel="linear", probability=True)
    clf.fit(X, y)

    model_path = os.path.join(model_dir, f"{class_name}_model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(clf, f)

    print(f"[INFO] Saved model: {model_path}")


if __name__ == "__main__":
    # Ask user which class to train
    print("Available classes:", os.listdir(dataset_path))
    class_name = input("Enter class name to train: ").strip()
    train_class(class_name)
