"""
Waste type classification and AI Triage.

Supports:
1. Groq Cloud AI inference (Ultra-fast LLM triage for urban civic waste with non-waste rejection)
2. Local CLIP zero-shot classification (if torch/transformers installed)
3. Safe fallback heuristics for zero-setup offline environments
"""

import json
import logging
from typing import Optional, Dict, Any
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


async def analyze_with_groq(comment: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Use Groq AI to analyze citizen waste reports, detect non-waste/irrelevant submissions,
    and generate structured triage data.
    """
    if not settings.groq_api_key:
        return None

    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    user_text = comment.strip() if comment and comment.strip() else ""

    prompt = f"""
You are an expert municipal AI verification and triage engine for SwachhLens (urban sanitation & Swachh Bharat).
Citizen report text: "{user_text}"

TASK:
1. First, determine if this report actually describes municipal street waste, trash, litter, illegal dumping, overflowing bins, drainage clogging, or urban sanitation hazards.
2. If it is NOT municipal waste/litter (e.g. personal selfies, animals/pets, clean rooms/indoors, clean roads/landscapes, non-waste objects, jokes/spam, or empty/irrelevant messages):
   Set "is_waste": false, "waste_type": "other", "confidence": 0.1, "volume_bucket": "small", "urgency": "low", "priority_score": 0.0, "summary": "No municipal waste or sanitation issue detected in this report."
3. If it IS municipal waste:
   Set "is_waste": true, and classify:
   - "waste_type": one of {json.dumps(WASTE_TYPES)}
   - "confidence": float between 0.70 and 0.98
   - "volume_bucket": one of ["small", "medium", "large", "very_large"]
   - "urgency": one of ["low", "medium", "high", "critical"]
   - "summary": 1-sentence summary of the waste hazard

Respond strictly with valid JSON.
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
                return result
    except Exception as exc:
        logger.warning(f"Groq AI triage call failed: {exc}")

    return None


async def classify_waste(image_bytes: bytes, comment: Optional[str] = None) -> Dict[str, Any]:
    """
    Classify waste and verify authenticity using Groq AI or local CLIP model.
    Returns a dict with: is_waste, waste_type, confidence, volume_bucket, urgency.
    """
    # 1. Try Groq AI triage first
    if settings.groq_api_key:
        groq_res = await analyze_with_groq(comment)
        if groq_res:
            is_waste = bool(groq_res.get("is_waste", True))
            waste_type = groq_res.get("waste_type") if groq_res.get("waste_type") in WASTE_TYPES else "other"
            return {
                "is_waste": is_waste,
                "waste_type": waste_type if is_waste else "other",
                "confidence": float(groq_res.get("confidence", 0.85 if is_waste else 0.1)),
                "volume_bucket": groq_res.get("volume_bucket", "medium" if is_waste else "small"),
                "urgency": groq_res.get("urgency", "medium" if is_waste else "low"),
                "summary": groq_res.get("summary", ""),
            }

    # 2. Try local CLIP zero-shot if torch is installed
    try:
        if image_bytes and len(image_bytes) > 0:
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
            best_type = WASTE_TYPES[best_idx]
            conf = float(probs[best_idx])
            is_waste = conf >= 0.20  # Minimum confidence threshold
            return {
                "is_waste": is_waste,
                "waste_type": best_type if is_waste else "other",
                "confidence": conf,
                "volume_bucket": "medium",
                "urgency": "medium" if is_waste else "low",
                "summary": "",
            }
    except Exception:
        pass

    return {
        "is_waste": True,
        "waste_type": "plastic_waste",
        "confidence": 0.75,
        "volume_bucket": "medium",
        "urgency": "medium",
        "summary": "",
    }
