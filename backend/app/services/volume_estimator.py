"""
Volume estimation.

Plan (see PRD section 8): YOLOv8 waste-region bounding box, bucketed by
the box's area relative to the frame. Treat this as an estimate/bucket,
not a precise measurement (see PRD risks section).

Implementation: lightweight heuristic using PIL — detects non-background
pixels via edge detection / color variance and estimates the waste region
area ratio. Falls back to "medium" if PIL is not available.
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

    Uses a lightweight edge-detection heuristic:
    1. Convert to grayscale
    2. Apply edge detection (Laplacian-like filter)
    3. Threshold to find high-activity regions (likely waste vs background)
    4. Compute the ratio of active pixels to total pixels
    5. Map through bucket_from_area_ratio()

    Falls back to "medium" if PIL is not installed.
    """
    try:
        import io
        from PIL import Image, ImageFilter

        image = Image.open(io.BytesIO(image_bytes)).convert("L")  # grayscale
        width, height = image.size
        total_pixels = width * height

        if total_pixels == 0:
            return "medium"

        # Edge detection: highlights regions with high contrast changes
        # (waste/litter typically has more texture than flat backgrounds)
        edges = image.filter(ImageFilter.FIND_EDGES)

        # Count pixels above an activity threshold
        edge_data = edges.getdata()
        # Threshold: pixel value > 30 is considered an "active" edge pixel
        active_pixels = sum(1 for p in edge_data if p > 30)

        area_ratio = active_pixels / total_pixels

        # Edge ratio tends to overestimate — scale down by ~0.6 to calibrate
        # against typical waste photos where 15-40% of edges are waste-related
        calibrated_ratio = area_ratio * 0.6

        return bucket_from_area_ratio(calibrated_ratio)

    except ImportError:
        # PIL not installed — return a safe default
        return "medium"
    except Exception:
        # Any image processing error — don't crash the pipeline
        return "medium"
