"""
Volume estimation via classical image processing - detects the
non-background/"busy" region of the photo and buckets its area
relative to the full frame. No training data required.
"""

import cv2
import numpy as np

VOLUME_BUCKETS = ["small", "medium", "large", "very_large"]
_THRESHOLDS = {"small": 0.05, "medium": 0.15, "large": 0.35}


def bucket_from_area_ratio(area_ratio: float) -> str:
    if area_ratio < _THRESHOLDS["small"]:
        return "small"
    if area_ratio < _THRESHOLDS["medium"]:
        return "medium"
    if area_ratio < _THRESHOLDS["large"]:
        return "large"
    return "very_large"


async def estimate_volume(image_bytes: bytes) -> str:
    arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        return "medium"

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(cv2.GaussianBlur(gray, (5, 5), 0), 50, 150)
    dilated = cv2.dilate(edges, np.ones((9, 9), np.uint8), iterations=2)

    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return "small"

    frame_area = img.shape[0] * img.shape[1]
    total_area = sum(cv2.contourArea(c) for c in contours)
    return bucket_from_area_ratio(total_area / frame_area)
