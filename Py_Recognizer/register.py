import cv2
import os
import time

def capture_images(class_name, student_name, num_images=50, delay=0.3):
    folder = f"Py_Recognizer/dataset/{class_name}/{student_name}"
    os.makedirs(folder, exist_ok=True)

    cap = cv2.VideoCapture(0)
    count = 0

    print(f"[INFO] Starting capture for {student_name} in {class_name}. Press 'q' to quit early.")

    while count < num_images:
        ret, frame = cap.read()
        if not ret:
            break

        img_path = os.path.join(folder, f"{count}.jpg")
        cv2.imwrite(img_path, frame)
        count += 1

        cv2.imshow("Capturing Images", frame)
        print(f"[INFO] Captured {count}/{num_images}")

        # Small delay for variation
        time.sleep(delay)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print(f"[INFO] Saved {count} images in {folder}")

if __name__ == "__main__":
    class_name = input("Enter class name: ")
    student_name = input("Enter student USN: ")
    capture_images(class_name, student_name)
