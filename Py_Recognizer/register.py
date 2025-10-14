import cv2
import os
import time

def capture_images(class_name, student_name, camera_index=1, num_images=50, delay=0.3):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    folder = os.path.join(BASE_DIR, "dataset", class_name, student_name)
    os.makedirs(folder, exist_ok=True)

    cap = cv2.VideoCapture(camera_index)
    count = 0

    print(f"[INFO] Starting capture for {student_name} in {class_name} using camera index {camera_index}. Press 'q' to quit early.")

    while count < num_images:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] Failed to capture image from camera.")
            break

        img_path = os.path.join(folder, f"{count}.jpg")
        cv2.imwrite(img_path, frame)
        count += 1

        cv2.imshow("Capturing Images", frame)
        print(f"[INFO] Captured {count}/{num_images}")

        time.sleep(delay)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print(f"[INFO] Saved {count} images in {folder}")

if __name__ == "__main__":
    class_name = input("Enter class name: ")
    student_name = input("Enter student USN: ")
    cam_index = input("Enter camera index (default 0 for built-in, 1 for USB): ").strip()
    cam_index = int(cam_index) if cam_index.isdigit() else 0
    capture_images(class_name, student_name, camera_index=cam_index)
