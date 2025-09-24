from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from torchvision import transforms, models
from PIL import Image
import io
import torch.nn as nn

app = Flask(__name__)
CORS(app)

# Emotion Model
emotion_model = models.resnet18()
emotion_model.fc = nn.Linear(emotion_model.fc.in_features, 7)
emotion_model.load_state_dict(torch.load(
    r'C:\Users\Santosh\OneDrive\Desktop\CBC_F-05\AI\best_fer_model.pt',
    map_location='cpu'
))
emotion_model.eval()
EMOTION_CLASSES = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
emotion_preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Head Pose Model
LABELS = ['Attentive', 'Looking Away']
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
headpose_model = models.mobilenet_v2(pretrained=True)
headpose_model.classifier[1] = nn.Linear(headpose_model.last_channel, 3)
headpose_model = headpose_model.to(DEVICE)
headpose_model.load_state_dict(torch.load(
    r'C:\Users\Santosh\OneDrive\Desktop\CBC_F-05\AI\head_pose_best_model.pt',
    map_location=DEVICE
))
headpose_model.eval()
headpose_preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def classify_attention(pitch, yaw, roll):
    if abs(pitch) < 20 and abs(yaw) < 25 and abs(roll) < 25:
        return LABELS[0]
    else:
        return LABELS[1]

def map_state(emotion, attention):
    # Map emotion and attention to {attentive, looking away, confused, bored}
    if attention == "Looking Away":
        return "looking away"
    if emotion in ["Angry", "Disgust", "Fear"]:
        return "confused"
    if emotion in ["Sad", "Surprise"]:
        return "bored"
    if emotion in ["Happy", "Neutral"] and attention == "Attentive":
        return "attentive"
    return "attentive"  # fallback

@app.route('/predict-state', methods=['POST'])
def predict_state():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    img_bytes = file.read()
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')

    # Emotion
    emotion_tensor = emotion_preprocess(img.convert('L')).unsqueeze(0)
    with torch.no_grad():
        emotion_outputs = emotion_model(emotion_tensor)
        _, predicted_emotion = torch.max(emotion_outputs, 1)
        emotion = EMOTION_CLASSES[predicted_emotion.item()]

    # Head pose
    headpose_tensor = headpose_preprocess(img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        output = headpose_model(headpose_tensor)
        pitch, yaw, roll = output[0].tolist()
        attention = classify_attention(pitch, yaw, roll)

    state = map_state(emotion, attention)

    return jsonify({
        'emotion': emotion,
        'attention': attention,
        'pitch': pitch,
        'yaw': yaw,
        'roll': roll,
        'state': state
    })

if __name__ == '__main__':
    app.run(debug=True)