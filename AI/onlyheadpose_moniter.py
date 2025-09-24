import torch
import torch.nn as nn
from torchvision import models, transforms
import cv2
import numpy as np
from PIL import Image


LABELS = ['Attentive', 'Looking Away']
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = models.mobilenet_v2(pretrained=True)
model.classifier[1] = nn.Linear(model.last_channel, 3)  # pitch, yaw, roll
model = model.to(DEVICE)


model.load_state_dict(torch.load('C:\\Users\\user\\OneDrive\\Desktop\\CBC_F-05_origin\\AI_2\\head_pose_best_model.pt', map_location=DEVICE))
model.eval()


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def classify_attention(pitch, yaw, roll):
    """
    Classifies attention based on head pose angles.
    Returns either 'Attentive' or 'Looking Away'.
    """

    if abs(pitch) < 20 and abs(yaw) < 25 and abs(roll) < 25:
        return LABELS[0]
    else:
        return LABELS[1]


cap = cv2.VideoCapture(0)
print("📷 Starting webcam...")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(img)
    img_tensor = transform(img_pil).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        output = model(img_tensor)
        pitch, yaw, roll = output[0].tolist()

    attention = classify_attention(pitch, yaw, roll)

 
    display_text = f'Pitch: {pitch:.1f}, Yaw: {yaw:.1f}, Roll: {roll:.1f} | {attention}'
    cv2.putText(frame, display_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                0.7, (0, 255, 0), 2, cv2.LINE_AA)

    cv2.imshow("Classroom Attention Monitor", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()




