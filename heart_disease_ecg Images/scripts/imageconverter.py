import os
import wfdb
import matplotlib.pyplot as plt

def ecg_to_image(record_path, save_path):
    """Convert a PTB-XL .dat/.hea record into a PNG image"""
    record = wfdb.rdrecord(record_path)
    
    plt.figure(figsize=(10, 4))
    plt.plot(record.p_signal[:, 0], linewidth=0.8, color='black')
    plt.axis('off')
    
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path, bbox_inches='tight', pad_inches=0)
    plt.close()

def convert_dataset_to_images(records_dir, output_dir):
    """Convert all ECG .dat files in PTB-XL to images"""
    for root, dirs, files in os.walk(records_dir):
        for file in files:
            if file.endswith(".dat"):
                record_path = os.path.join(root, file[:-4])
                save_name = file.replace(".dat", ".png")
                save_path = os.path.join(output_dir, save_name)
                try:
                    ecg_to_image(record_path, save_path)
                    print(f"✅ Saved: {save_path}")
                except Exception as e:
                    print(f"❌ Error converting {file}: {e}")

records_dir = r"C:\AI\heart_disease_ecg Images\heart_disease_ecg Images\data\ptb-xl-a-large-publicly-available-electrocardiography-dataset-1.0.3\records500"
output_dir = r"C:\AI\heart_disease_ecg Images\heart_disease_ecg Images\data\images"
convert_dataset_to_images(records_dir, output_dir)
