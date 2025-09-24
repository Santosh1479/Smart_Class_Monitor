import cv2
import torch
import torchvision.transforms as transforms
from PIL import Image
from torchvision import models

# Labels
gaze_emotion_labels = ['Attentive', 'Looking Away', 'Bored', 'Confused']

# Define the Gaze Emotion Model Architecture
class GazeEmotionModel(torch.nn.Module):
    def __init__(self):
        super(GazeEmotionModel, self).__init__()
        self.model = models.resnet18(weights=None)  # Ensure this matches the training architecture
        self.model.fc = torch.nn.Linear(self.model.fc.in_features, len(gaze_emotion_labels))  # Adjust output layer

    def forward(self, x):
        return self.model(x)

# Initialize the model
gaze_emotion_model = GazeEmotionModel()

# Load the state dictionary into the model
state_dict = torch.load(r'c:\Users\Santosh\OneDrive\Desktop\CBC_F-05\AI\best_model.pt', map_location=torch.device('cpu'))
gaze_emotion_model.load_state_dict(state_dict, strict=False)  # Allow partial loading

# Set the model to evaluation mode
gaze_emotion_model.eval()

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

def capture_and_evaluate():
    """Capture a single frame, predict gaze emotion, and save the frame."""
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Unable to access webcam.")
        return

    ret, frame = cap.read()
    if not ret:
        print("Error: Unable to capture frame from webcam.")
        cap.release()
        return

    # Preprocess the frame
    img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    img_tensor = transform(img_pil)

    # Predict gaze emotion
    with torch.no_grad():
        outputs = gaze_emotion_model(img_tensor.unsqueeze(0))
        _, predicted = torch.max(outputs, 1)
        emotion = gaze_emotion_labels[predicted.item()]

    # Write the prediction on the frame
    cv2.putText(frame, f"Emotion: {emotion}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    # Save the frame
    saved_image_path = "captured_frame.jpg"
    cv2.imwrite(saved_image_path, frame)
    print(f"Emotion: {emotion}")
    print(f"Frame saved as: {saved_image_path}")

    cap.release()

if __name__ == '__main__':
    print("Press 'c' to capture and evaluate a frame.")
    print("Press 'q' to quit the program.")

    while True:
        user_input = input("Enter your choice: ").strip().lower()
        if user_input == 'c':
            capture_and_evaluate()
        elif user_input == 'q':
            print("Exiting the program.")
            break
        else:
            print("Invalid input. Please press 'c' to capture or 'q' to quit.")