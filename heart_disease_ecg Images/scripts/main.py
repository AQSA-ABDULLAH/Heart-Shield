import uvicorn
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
from fastapi import FastAPI, File, UploadFile

# --- 1. SETUP & CONFIGURATION ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model():
    model = models.resnet18(weights=None)
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_features, 4),  # 4 outputs
        nn.Sigmoid()
    )

    model.load_state_dict(torch.load("ecg_cnn_mutlilabel.pth", map_location=device))        
    model = model.to(device)
    model.eval()
    return model

model = load_model()

# --- 3. PREPROCESSING ---
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

# --- 4. FASTAPI APP ---
app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "ECG AI Prediction Server is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    
    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        preds = model(input_tensor).cpu().numpy()[0]

    labels = ["CAD", "HF", "ARR", "Overall_Risk"]
    results = {labels[i]: float(preds[i]) for i in range(len(labels))}

    return results

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)