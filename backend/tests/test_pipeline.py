import pytest
from app.services import priority_scorer, dispatch_recommender, duplicate_detector


def test_priority_scorer_volume():
    """Verify priority score calculations for different volume buckets."""
    score_small = priority_scorer.compute_priority_score("small", location_sensitivity=1, report_frequency=1)
    score_medium = priority_scorer.compute_priority_score("medium", location_sensitivity=1, report_frequency=1)
    score_large = priority_scorer.compute_priority_score("large", location_sensitivity=1, report_frequency=1)
    score_very_large = priority_scorer.compute_priority_score("very_large", location_sensitivity=1, report_frequency=1)

    assert score_small < score_medium < score_large < score_very_large
    assert score_small == 6.5  # (3*1 + 2*1 + 1.5*1)
    assert score_very_large == 15.5  # (3*4 + 2*1 + 1.5*1)


def test_priority_scorer_sensitivity_and_frequency():
    """Verify multipliers for sensitive locations and recurring dumps."""
    base_score = priority_scorer.compute_priority_score("medium", location_sensitivity=1, report_frequency=1)
    high_sensitivity_score = priority_scorer.compute_priority_score("medium", location_sensitivity=3, report_frequency=1)
    frequent_report_score = priority_scorer.compute_priority_score("medium", location_sensitivity=1, report_frequency=3)

    assert base_score == 9.5  # (3*2 + 2*1 + 1.5*1)
    assert high_sensitivity_score == 13.5  # (3*2 + 2*3 + 1.5*1)
    assert frequent_report_score == 12.5  # (3*2 + 2*1 + 1.5*3)


def test_urgency_from_score():
    """Verify urgency band mapping from priority score."""
    assert priority_scorer.urgency_from_score(4.0) == "low"
    assert priority_scorer.urgency_from_score(8.5) == "medium"
    assert priority_scorer.urgency_from_score(14.0) == "high"
    assert priority_scorer.urgency_from_score(22.0) == "critical"


def test_dispatch_recommender_teams():
    """Verify municipal team and vehicle recommendations for various waste types."""
    hazardous = dispatch_recommender.recommend_response("hazardous_waste", "medium", "critical")
    assert hazardous["team"] == "hazard-response team"
    assert hazardous["vehicle"] == "specialized hazard vehicle"

    recyclable = dispatch_recommender.recommend_response("plastic_waste", "medium", "low")
    assert recyclable["team"] == "recycling partner"
    assert recyclable["vehicle"] == "recycling collection vehicle"

    large_bulk = dispatch_recommender.recommend_response("organic_waste", "large", "medium")
    assert large_bulk["team"] == "extra sanitation crew"
    assert large_bulk["vehicle"] == "mini truck"

    routine = dispatch_recommender.recommend_response("overflowing_bin", "small", "low")
    assert routine["team"] == "manual cleanup team"
    assert routine["vehicle"] == "handcart"


def test_haversine_distance():
    """Verify distance calculation between GPS coordinates."""
    # New Delhi Connaught Place to India Gate (~2.2 km)
    dist = duplicate_detector._haversine_meters(28.6304, 77.2177, 28.6129, 77.2295)
    assert 2000 < dist < 2500

    # Same location
    same_dist = duplicate_detector._haversine_meters(28.6304, 77.2177, 28.6304, 77.2177)
    assert same_dist == 0.0
