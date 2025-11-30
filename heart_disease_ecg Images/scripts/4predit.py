import streamlit as st
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import zipfile
import os
import pandas as pd
import io

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

labels = ["CAD", "HF", "ARR", "Overall_Risk"]

st.title("💓 Heart Disease Prediction - Batch File Mode")
st.write("Upload a ZIP file of ECG images to get predictions for all images.")

uploaded_zip = st.file_uploader("Upload ZIP file containing ECG images...", type=["zip"])

if uploaded_zip is not None:
    with zipfile.ZipFile(uploaded_zip, "r") as zip_ref:
        extract_path = "temp_ecg_images"
        zip_ref.extractall(extract_path)

    results_list = []

    for file_name in os.listdir(extract_path):
        if file_name.lower().endswith((".png", ".jpg", ".jpeg")):
            img_path = os.path.join(extract_path, file_name)
            image = Image.open(img_path).convert("RGB")

            input_tensor = transform(image).unsqueeze(0).to(device)

            with torch.no_grad():
                preds = model(input_tensor).cpu().numpy()[0]

            result_dict = {"File": file_name}
            for i, label in enumerate(labels):
                score = float(preds[i])
                risk_status = "High Risk" if score >= 0.5 else "Low Risk"
                result_dict[label] = f"{score:.4f} ({risk_status})"
            
            results_list.append(result_dict)

    df = pd.DataFrame(results_list)
    st.subheader("📊 Prediction Results for All Images")
    st.dataframe(df)

    csv = df.to_csv(index=False).encode("utf-8")
    st.download_button(
        label="⬇️ Download Results as CSV",
        data=csv,
        file_name="ecg_predictions.csv",
        mime="text/csv",
    )

    st.success("✅ Batch prediction complete!")
