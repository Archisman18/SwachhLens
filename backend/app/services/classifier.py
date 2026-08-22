"""
Waste type classification via CLIP zero-shot classification.
No training data needed - CLIP scores the photo against natural-
language descriptions of each category and picks the best match.

Model is loaded lazily on first call so the server starts even
when torch/transformers are not installed.
"""

CATEGORY_PROMPTS = {
    "overflowing_bin": "an overflowing trash bin or dustbin",
    "illegal_dump": "an illegal garbage dump on the street",
    "plastic_waste": "scattered plastic waste and bottles",
    "construction_debris": "construction and demolition debris",
    "organic_waste": "organic or food waste",
    "e_waste": "discarded electronic waste like appliances or wires",
    "hazardous_waste": "hazardous or chemical waste",
    "drain_blockage": "a blocked or clogged drain",
    "other": "general litter or waste",
}

WASTE_TYPES = list(CATEGORY_PROMPTS.keys())

_MODEL_NAME = "openai/clip-vit-base-patch32"
_model = None
_processor = None


def _load_model():
    global _model, _processor
    if _model is not None:
        return

    import torch
    from transformers import CLIPModel, CLIPProcessor

    _model = CLIPModel.from_pretrained(_MODEL_NAME)
    _processor = CLIPProcessor.from_pretrained(_MODEL_NAME)
    _model.eval()


async def classify_waste(image_bytes: bytes) -> tuple[str, float]:
    import io
    import torch
    from PIL import Image

    _load_model()

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    prompts = list(CATEGORY_PROMPTS.values())

    inputs = _processor(text=prompts, images=image, return_tensors="pt", padding=True)
    with torch.no_grad():
        outputs = _model(**inputs)
        probs = outputs.logits_per_image.softmax(dim=1)[0]

    best_idx = int(probs.argmax())
    return WASTE_TYPES[best_idx], float(probs[best_idx])
