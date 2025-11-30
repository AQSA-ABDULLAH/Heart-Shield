import pandas as pd
import os

base_dir = r"C:\AI\heart_disease_ecg Images\heart_disease_ecg Images\data\ptb-xl-a-large-publicly-available-electrocardiography-dataset-1.0.3"   # for uploaded files
csv_path = os.path.join(base_dir, "ptbxl_database.csv")
scp_path = os.path.join(base_dir, "scp_statements.csv")
output_path = os.path.join(base_dir, "combined_labels_multilabel.csv")

df = pd.read_csv(csv_path)
scp_df = pd.read_csv(scp_path)

diagnostic_map = scp_df.set_index("Unnamed: 0")["diagnostic_class"].to_dict()

df["CAD"] = 0
df["HF"] = 0
df["ARR"] = 0

def map_conditions(scp_codes):
    cad, hf, arr = 0, 0, 0
    if pd.isna(scp_codes):
        return cad, hf, arr

    try:
        codes = eval(scp_codes)
    except:
        return cad, hf, arr

    for code in codes.keys():
        if code in diagnostic_map:
            diag = diagnostic_map[code]
            if diag == "MI":
                cad = 1
            elif diag == "STTC":
                cad = 1
            elif diag == "HYP":
                hf = 1
            elif diag == "ARR":
                arr = 1

    return cad, hf, arr

df[["CAD", "HF", "ARR"]] = df["scp_codes"].apply(lambda x: pd.Series(map_conditions(x)))

df["Overall_Risk"] = df[["CAD","HF","ARR"]].max(axis=1)

df.to_csv(output_path, index=False)

print("✅ Multi-label dataset created:", output_path)
print(df[["CAD","HF","ARR","Overall_Risk"]].value_counts())
