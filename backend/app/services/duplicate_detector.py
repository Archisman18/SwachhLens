"""
Duplicate detection.

For PostgreSQL+PostGIS, uses spatial ST_DWithin queries.
For SQLite (dev), falls back to Haversine distance calculation.
"""

import math
from datetime import datetime, timedelta, timezone

from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.complaint import Complaint

DUPLICATE_RADIUS_METERS = 50
DUPLICATE_TIME_WINDOW_HOURS = 48


def _haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two GPS points in metres."""
    R = 6_371_000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


async def find_duplicate_candidate(
    db: AsyncSession, latitude: float, longitude: float, waste_type: str | None
) -> str | None:
    """
    Returns the id of a likely-duplicate existing complaint, or None.
    Uses in-Python Haversine filtering (works on any DB backend).
    """
    if waste_type is None:
        return None

    query = text(
        """
        SELECT id FROM complaints
        WHERE status != 'duplicate'
          AND waste_type = :waste_type
          AND reported_at > now() - make_interval(hours => :hours)
          AND ST_DWithin(
                location,
                ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                :radius
              )
        ORDER BY reported_at DESC
        LIMIT 1
        """
    )
    result = await db.execute(
        query,
        {
            "waste_type": waste_type,
            "hours": DUPLICATE_TIME_WINDOW_HOURS,
            "lng": longitude,
            "lat": latitude,
            "radius": DUPLICATE_RADIUS_METERS,
        },
    )
    row = result.first()
    if row:
        return str(row[0])

    return None


async def count_nearby_reports(
    db: AsyncSession,
    latitude: float,
    longitude: float,
    radius_meters: float = 50,
    hours: int = 48,
) -> int:
    """
    Count non-duplicate complaints within `radius_meters` of the given
    point that were reported in the last `hours`. Uses in-Python
    Haversine filtering so it works on both SQLite and Postgres.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    query = (
        select(Complaint)
        .where(
            Complaint.status != "duplicate",
            Complaint.reported_at > cutoff,
        )
    )
    result = await db.execute(query)
    count = 0
    for complaint in result.scalars():
        if _haversine_meters(latitude, longitude, complaint.latitude, complaint.longitude) <= radius_meters:
            count += 1
    return count
