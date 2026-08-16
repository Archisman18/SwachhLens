"""
Dispatch recommendation - rule engine mapping (waste_type, volume_bucket,
urgency) -> suggested team + vehicle. See PRD section 5.2.
"""

HAZARD_TYPES = {"hazardous_waste", "e_waste", "drain_blockage"}
RECYCLABLE_TYPES = {"plastic_waste"}


def recommend_response(waste_type: str | None, volume_bucket: str | None, urgency: str) -> dict:
    if waste_type in HAZARD_TYPES or urgency == "critical":
        return {
            "team": "hazard-response team",
            "vehicle": "specialized hazard vehicle",
            "urgency": "critical",
        }

    if waste_type in RECYCLABLE_TYPES:
        return {
            "team": "recycling partner",
            "vehicle": "recycling collection vehicle",
            "urgency": urgency,
        }

    if volume_bucket in ("large", "very_large"):
        return {
            "team": "extra sanitation crew",
            "vehicle": "mini truck",
            "urgency": urgency,
        }

    return {
        "team": "manual cleanup team",
        "vehicle": "handcart",
        "urgency": urgency,
    }
