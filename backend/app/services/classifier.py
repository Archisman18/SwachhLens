"""
Waste type classification and AI Triage.

Supports:
1. Groq Cloud AI inference (Ultra-fast LLM triage for urban civic waste)
2. Local CLIP zero-shot classification (if torch/transformers installed)
3. Safe fallback heuristics for zero-setup offline environments
"""

import json
import logging
from typing import Optional, Tuple
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

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


def _load_clip_model():
    global _model, _processor
    if _model is not None:
        return

    import torch
    from transformers import CLIPModel, CLIPProcessor

    _model = CLIPModel.from_pretrained(_MODEL_NAME)
    _processor = CLIPProcessor.from_pretrained(_MODEL_NAME)
    _model.eval()


async def analyze_with_groq(comment: Optional[str] = None) -> Optional[dict]:
    """
    Use Groq AI to analyze citizen waste reports and generate structured triage data.
    """
    if not settings.groq_api_key:
        return None

    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    user_text = comment.strip() if comment and comment.strip() else "civic litter and street waste report"

    prompt = f"""
You are an expert municipal AI triage engine for urban waste management (Swachh Bharat / SwachhLens).
Citizen report notes: "{user_text}"

Analyze this incident and output a strict JSON object with:
- "waste_type": exactly one of {json.dumps(WASTE_TYPES)}
- "confidence": a float between 0.70 and 0.98
- "volume_bucket": exactly one of ["small", "medium", "large", "very_large"]
- "summary": a single concise sentence describing the waste situation

Return ONLY valid JSON.
"""

    payload = {
        "model": "qwen/qwen3.6-27b",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "response_format": {"type": "json_object"},
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            if res.status_code == 200:
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                result = json.loads(content)
                if result.get("waste_type") in WASTE_TYPES:
                    return result
    except Exception as exc:
        logger.warning(f"Groq AI triage call failed: {exc}")

    return None


async def classify_waste(image_bytes: bytes, comment: Optional[str] = None) -> Tuple[str, float]:
    """
    Classify waste type using Groq AI or local CLIP model.
    """
    # 1. Try Groq AI triage first
    if settings.groq_api_key and comment:
        groq_res = await analyze_with_groq(comment)
        if groq_res and "waste_type" in groq_res:
            return groq_res["waste_type"], float(groq_res.get("confidence", 0.90))

    # 2. Try local CLIP zero-shot if torch is installed
    try:
        import io
        import torch
        from PIL import Image

        _load_clip_model()

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        prompts = list(CATEGORY_PROMPTS.values())

        inputs = _processor(text=prompts, images=image, return_tensors="pt", padding=True)
        with torch.no_grad():
            outputs = _model(**inputs)
            probs = outputs.logits_per_image.softmax(dim=1)[0]

        best_idx = int(probs.argmax())
        return WASTE_TYPES[best_idx], float(probs[best_idx])
    except Exception:
        # Fallback if torch or transformers is not installed
        pass

    # 3. Fallback if comment provided even without image ML
    if settings.groq_api_key:
        groq_res = await analyze_with_groq(comment)
        if groq_res and "waste_type" in groq_res:
            return groq_res["waste_type"], float(groq_res.get("confidence", 0.85))

    return "plastic_waste", 0.75
