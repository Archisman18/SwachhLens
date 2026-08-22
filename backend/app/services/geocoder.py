"""
Reverse geocoding for location sensitivity scoring.

Uses OpenStreetMap Nominatim to reverse-geocode a lat/lng and check
proximity to sensitive POIs (schools, hospitals, water bodies, etc.).
Falls back gracefully to the default sensitivity if the API is
unreachable, rate-limited, or errors out.
"""

import logging
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

LOCATION_SENSITIVITY_DEFAULT = 1

# Keywords that indicate sensitive locations, grouped by sensitivity level
_HIGH_SENSITIVITY_KEYWORDS = {
    "school", "college", "university", "kindergarten",
    "hospital", "clinic", "pharmacy", "doctors",
    "childcare", "nursery",
}

_MEDIUM_SENSITIVITY_KEYWORDS = {
    "lake", "river", "stream", "pond", "reservoir", "water",
    "park", "garden", "playground", "recreation",
    "temple", "mosque", "church", "gurudwara", "shrine",
    "market", "bus_station", "railway",
}

_NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
_NOMINATIM_TIMEOUT = 5  # seconds
_USER_AGENT = "SwachhLens/1.0 (civic-waste-mgmt; contact@swachhlens.dev)"


def _score_from_text(text: str) -> int:
    """Check a lowered text blob against keyword sets and return a sensitivity score."""
    lower = text.lower()
    for kw in _HIGH_SENSITIVITY_KEYWORDS:
        if kw in lower:
            return 3
    for kw in _MEDIUM_SENSITIVITY_KEYWORDS:
        if kw in lower:
            return 2
    return LOCATION_SENSITIVITY_DEFAULT


async def get_location_sensitivity(latitude: float, longitude: float) -> int:
    """
    Reverse-geocode `(latitude, longitude)` and return a location
    sensitivity score:
      3 = near school / hospital (high sensitivity)
      2 = near water body / park / religious site / transit hub
      1 = default / unknown

    On any failure (network, timeout, rate-limit, bad response) returns
    the default value (1) — this should never block complaint submission.
    """
    try:
        async with httpx.AsyncClient(timeout=_NOMINATIM_TIMEOUT) as client:
            resp = await client.get(
                _NOMINATIM_REVERSE_URL,
                params={
                    "lat": latitude,
                    "lon": longitude,
                    "format": "jsonv2",
                    "addressdetails": 1,
                    "zoom": 18,  # building-level detail
                },
                headers={"User-Agent": _USER_AGENT},
            )
            resp.raise_for_status()
            data = resp.json()

        # Build a single text blob from the most useful fields
        parts: list[str] = []

        # display_name is the full formatted address
        if dn := data.get("display_name"):
            parts.append(dn)

        # 'type' and 'category' from Nominatim give the OSM feature type
        if cat := data.get("category"):
            parts.append(cat)
        if typ := data.get("type"):
            parts.append(typ)

        # addressdetails keys
        if addr := data.get("address"):
            parts.extend(str(v) for v in addr.values())

        combined = " ".join(parts)
        score = _score_from_text(combined)

        logger.info(
            "Geocoded (%s, %s) → sensitivity=%d | %s",
            latitude, longitude, score, data.get("display_name", "?")[:100],
        )
        return score

    except Exception as exc:
        logger.warning(
            "Reverse geocoding failed for (%s, %s): %s — using default sensitivity %d",
            latitude, longitude, exc, LOCATION_SENSITIVITY_DEFAULT,
        )
        return LOCATION_SENSITIVITY_DEFAULT
