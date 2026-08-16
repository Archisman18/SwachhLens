"""
Volume estimation.

Plan (see PRD section 8): YOLOv8 waste-region bounding box, bucketed by
the box's area relative to the frame. Treat this as an estimate/bucket,
not a precise measurement (see PRD risks section).
"""

VOLUME_BUCKETS = ["small", "medium", "large", "very_large"]

# bbox_area / frame_area thresholds - tune against real sample photos
_THRESHOLDS = {
    "small": 0.05,
    "medium": 0.15,
    "large": 0.35,
    # anything above the "large" threshold is bucketed "very_large"
}


def bucket_from_area_ratio(area_ratio: float) -> str:
    if area_ratio < _THRESHOLDS["small"]:
        return "small"
    if area_ratio < _THRESHOLDS["medium"]:
        return "medium"
    if area_ratio < _THRESHOLDS["large"]:
        return "large"
    return "very_large"


async def estimate_volume(image_bytes: bytes) -> str:
    """
    Detect the waste region and return a volume bucket.

    TODO: run YOLOv8 detection, compute bbox area / frame area,
    pass through bucket_from_area_ratio().
    """
    raise NotImplementedError("Plug in the YOLOv8 detector here")
