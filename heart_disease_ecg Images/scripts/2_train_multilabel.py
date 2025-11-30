import pandas as pd
from sklearn.model_selection import train_test_split
import os

base_dir = r"C:\AI\heart_disease_ecg Images\heart_disease_ecg Images\data\ptb-xl-a-large-publicly-available-electrocardiography-dataset-1.0.3"
csv_path = os.path.join(base_dir, "combined_labels_multilabel.csv")

df = pd.read_csv(csv_path)

train, test = train_test_split(df, test_size=0.2, random_state=42, stratify=df["Overall_Risk"])
train, val = train_test_split(train, test_size=0.2, random_state=42, stratify=train["Overall_Risk"])

print("Train:", len(train), "Val:", len(val), "Test:", len(test))

train.to_csv(os.path.join(base_dir, "train.csv"), index=False)
val.to_csv(os.path.join(base_dir, "val.csv"), index=False)
test.to_csv(os.path.join(base_dir, "test.csv"), index=False)

print("✅ Train/Val/Test CSVs saved")
