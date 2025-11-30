import uvicorn
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
from fastapi import FastAPI, File, UploadFile

# 1. Device aur Model Loading Code (Aapke code se)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model():
    model = models.resnet18(weights=None)
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_features, 4),  # 4 outputs
        nn.Sigmoid()
    )
    model.load_state_dict(torch.load("ecg_cnn_multilabel.pth", map_location=device))
    model = model.to(device)
    model.eval()
    return model

# Model ko pehle se load kar lein
model = load_model()

# Image transformation code (Aapke code se)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

# 2. FastAPI App Banayein
app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "ECG AI Prediction Server is running"}

# 3. Prediction Endpoint Banayein
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # File ko memory mein parhein
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    # Image ko process karein
    input_tensor = transform(image).unsqueeze(0).to(device)

    # Prediction karein
    with torch.no_grad():
        preds = model(input_tensor).cpu().numpy()[0]

    # Results ko format karein
    labels = ["CAD", "HF", "ARR", "Overall_Risk"]
    results = {labels[i]: float(preds[i]) for i in range(len(labels))}

    # JSON response wapas bhejein
    return results

# 4. Server Ko Chalane Ke Liye
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)