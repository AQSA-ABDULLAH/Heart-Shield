import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from PIL import Image
import pandas as pd

class ECGImageDataset(Dataset):
    def __init__(self, csv_file, img_dir, transform=None):
        self.data = pd.read_csv(csv_file)
        self.img_dir = img_dir
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        row = self.data.iloc[idx]

        base_name = os.path.basename(row['filename_hr'])
        img_name = base_name + ".png"
        img_path = os.path.join(self.img_dir, img_name)

        image = Image.open(img_path).convert("RGB")

        labels = torch.tensor([
            row['CAD'],
            row['HF'],
            row['ARR'],
            row['Overall_Risk']
        ], dtype=torch.float32)

        if self.transform:
            image = self.transform(image)

        return image, labels

TRAIN_CSV = r"C:\AI\heart_disease_ecg Images\heart_disease_ecg Images\data\ptb-xl-a-large-publicly-available-electrocardiography-dataset-1.0.3\train.csv"
IMG_DIR   = r"C:\AI\heart_disease_ecg Images\heart_disease_ecg Images\data\images"

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

train_dataset = ECGImageDataset(TRAIN_CSV, IMG_DIR, transform=transform)
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)

# -----------------------------
# Model - ResNet18
# -----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = models.resnet18(weights="IMAGENET1K_V1")  # Pretrained ResNet18
num_features = model.fc.in_features
model.fc = nn.Sequential(
    nn.Linear(num_features, 4),
    nn.Sigmoid()
)
model = model.to(device)

criterion = nn.BCELoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

def multilabel_accuracy(y_pred, y_true, threshold=0.5):
    """
    Computes multi-label accuracy:
    Compares predictions with ground truth across all labels.
    """
    y_pred = (y_pred >= threshold).float()
    correct = (y_pred == y_true).float().sum()
    total = torch.numel(y_true)
    return correct / total

EPOCHS = 10

for epoch in range(EPOCHS):
    model.train()
    running_loss = 0.0
    running_acc = 0.0
    total_batches = 0

    for imgs, labels in train_loader:
        imgs, labels = imgs.to(device), labels.to(device)

        outputs = model(imgs)
        loss = criterion(outputs, labels)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        acc = multilabel_accuracy(outputs, labels)

        running_loss += loss.item()
        running_acc += acc.item()
        total_batches += 1

    epoch_loss = running_loss / total_batches
    epoch_acc = running_acc / total_batches

    print(f"Epoch [{epoch+1}/{EPOCHS}] "
          f"Loss: {epoch_loss:.4f} | Accuracy: {epoch_acc:.4f}")

torch.save(model.state_dict(), "ecg_cnn_multilabel.pth")
print("✅ Model training complete & saved as ecg_cnn_multilabel.pth")
