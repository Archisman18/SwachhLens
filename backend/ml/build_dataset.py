import os, random, shutil

SCRAPED_DIR = "scraped"
KAGGLE_DIR = r"C:\Users\Archisman\Downloads\archive\garbage-classification"  # <-- EDIT THIS to your real path from Step 1
OUTPUT_DIR = "backend/ml/dataset_raw"
SAMPLE_SIZE = 200

SCENE_CLASSES = {
    "overflowing_bin": "overflowing_bin",
    "illegal_dump": "illegal_dump",
    "construction_debris": "construction_debris",
    "hazardous_waste": "hazardous_waste",
    "drain_blockage": "drain_blockage",
}

MATERIAL_CLASSES = {
    "plastic": "plastic_waste",
    "biological": "organic_waste",
    "battery": "e_waste",
    "trash": "other",
}

os.makedirs(OUTPUT_DIR, exist_ok=True)

for src_name, dst_name in SCENE_CLASSES.items():
    src = os.path.join(SCRAPED_DIR, src_name)
    dst = os.path.join(OUTPUT_DIR, dst_name)
    shutil.copytree(src, dst, dirs_exist_ok=True)
    print(f"{src_name} -> {dst_name}: {len(os.listdir(dst))} images")

for src_name, dst_name in MATERIAL_CLASSES.items():
    src = os.path.join(KAGGLE_DIR, src_name)
    dst = os.path.join(OUTPUT_DIR, dst_name)
    os.makedirs(dst, exist_ok=True)
    files = os.listdir(src)
    sample = random.sample(files, min(SAMPLE_SIZE, len(files)))
    for f in sample:
        shutil.copy(os.path.join(src, f), os.path.join(dst, f))
    print(f"{src_name} -> {dst_name}: {len(sample)} images (sampled)")

print("\nDone. Combined dataset at:", OUTPUT_DIR)