import streamlit as st
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

@st.cache_resource
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

model = load_model()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])  
])

st.title("Heart Disease Prediction from ECG Images")
st.write("Upload an ECG image to predict risks of CAD, HF, ARR, and Overall Risk.")

uploaded_file = st.file_uploader("Choose an ECG image...", type=["png", "jpg", "jpeg"])

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("RGB")
    st.image(image, caption="Uploaded ECG Image", use_column_width=True)

    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        preds = model(input_tensor).cpu().numpy()[0]

    labels = ["CAD", "HF", "ARR", "Overall_Risk"]
    results = {labels[i]: float(preds[i]) for i in range(len(labels))}

    st.subheader("🔎 Prediction Results")
    threshold = 0.5
    for label, score in results.items():
        risk_status = "🟥 High Risk" if score >= threshold else "🟩 Low Risk"
        st.write(f"**{label}:** {score:.4f} → {risk_status}")
        st.progress(min(max(score, 0.0), 1.0))  

    st.success("✅ Prediction complete!")
