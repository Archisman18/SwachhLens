"""
Waste type classification.

Plan (see PRD section 8): MobileNetV2/EfficientNet-B0 fine-tuned on the
Kaggle Garbage Classification dataset, or a Roboflow pretrained endpoint
if you're short on time.
"""

WASTE_TYPES = [
    "overflowing_bin", "illegal_dump", "plastic_waste", "construction_debris",
    "organic_waste", "e_waste", "hazardous_waste", "drain_blockage", "other",
]


async def classify_waste(image_bytes: bytes) -> tuple[str, float]:
    """
    Classify the waste type in an image.

    Returns:
        (waste_type, confidence) where waste_type is one of WASTE_TYPES
        and confidence is 0-1.

    TODO: load the trained model once at startup (not per-request) and
    run inference here. For now this is a stub so the API is wireable
    end-to-end before the model is ready.
    """
    raise NotImplementedError("Plug in the trained classifier here")
