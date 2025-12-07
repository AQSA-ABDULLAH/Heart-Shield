import uvicorn
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from transformers import CLIPProcessor, CLIPModel

# --- 1. SETUP & CONFIGURATION ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- 2. LOAD MODELS ---

# A. Load Heart Disease Model (ResNet18)
def load_heart_model():
    print("Loading Heart Disease Model...")
    model = models.resnet18(weights=None)
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_features, 4),  # 4 outputs
        nn.Sigmoid()
    )
    try:
        model.load_state_dict(torch.load("ecg_cnn_multilabel.pth", map_location=device))
    except FileNotFoundError:
        print("⚠️ Warning: 'ecg_cnn_multilabel.pth' not found. Prediction will fail.")
        return None
        
    model = model.to(device)
    model.eval()
    return model

# B. Load Gatekeeper Model (CLIP)
def load_clip_model():
    print("Loading CLIP Validation Model...")
    # Load pre-trained model for image-text comparison
    model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    return model, processor

# Initialize models globally so they load only once on startup
heart_model = load_heart_model()
clip_model, clip_processor = load_clip_model()

# --- 3. PREPROCESSING ---
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

# --- 4. FASTAPI APP ---
app = FastAPI(title="ECG Prediction API with Validation")

@app.get("/")
def read_root():
    return {"message": "ECG AI Prediction Server is running. Use /predict to analyze images."}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # 1. Read Image
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file.")

    # 2. VALIDATION STEP (CLIP)
    # Define labels: "Is it an ECG?" vs "Is it random?"
    validation_labels = ["an electrocardiogram heart rate graph", "a random photo of a person or object"]
    
    # Prepare inputs for CLIP
    inputs = clip_processor(text=validation_labels, images=image, return_tensors="pt", padding=True).to(device)
    
    with torch.no_grad():
        outputs = clip_model(**inputs)
        probs = outputs.logits_per_image.softmax(dim=1) # Convert scores to probabilities

    # Get probability of being an ECG (index 0)
    ecg_probability = probs[0][0].item()

    # If confidence is low (< 80%), reject the request
    if ecg_probability < 0.80:
        raise HTTPException(
            status_code=400, 
            detail={
                "error": "Image validation failed. This does not look like an ECG.",
                "confidence_score": float(ecg_probability),
                "message": "Please upload a clear image of an ECG graph."
            }
        )

    # 3. PREDICTION STEP (Only runs if validation passes)
    if heart_model is None:
        raise HTTPException(status_code=500, detail="Heart model not loaded correctly on server.")

    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        preds = heart_model(input_tensor).cpu().numpy()[0]

    labels = ["CAD", "HF", "ARR", "Overall_Risk"]
    results = {labels[i]: float(preds[i]) for i in range(len(labels))}

    # Add the validation score to the response for transparency
    results["is_ecg_confidence"] = ecg_probability

    return results

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)