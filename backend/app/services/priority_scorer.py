"""
Priority scoring - plain weighted formula (see PRD section 5.2 & 8).
Deliberately not ML: transparent and easy to tune live for judges.
"""

VOLUME_WEIGHTS = {"small": 1, "medium": 2, "large": 3, "very_large": 4}

# Extend with real sensitivity logic later (e.g. reverse-geocode and
# check proximity to schools/hospitals/water bodies).
LOCATION_SENSITIVITY_DEFAULT = 1

WEIGHTS = {
    "volume": 3.0,
    "location_sensitivity": 2.0,
    "report_frequency": 1.5,
    "age_hours": 0.05,  # small continuous bump the longer it's unresolved
}


def compute_priority_score(
    volume_bucket: str | None,
    location_sensitivity: int = LOCATION_SENSITIVITY_DEFAULT,
    report_frequency: int = 1,
    age_hours: float = 0,
) -> float:
    volume_score = VOLUME_WEIGHTS.get(volume_bucket, 1)
    score = (
        WEIGHTS["volume"] * volume_score
        + WEIGHTS["location_sensitivity"] * location_sensitivity
        + WEIGHTS["report_frequency"] * report_frequency
        + WEIGHTS["age_hours"] * age_hours
    )
    return round(score, 2)


def urgency_from_score(score: float) -> str:
    if score >= 20:
        return "critical"
    if score >= 12:
        return "high"
    if score >= 6:
        return "medium"
    return "low"
