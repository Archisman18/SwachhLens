"""
Duplicate detection.

GPS proximity + time window + same waste_type, using the PostGIS
`location` column (see db/schema.sql). Image-similarity (CLIP
embeddings) is a "Could have" stretch per the PRD - not required for MVP.
"""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

DUPLICATE_RADIUS_METERS = 50
DUPLICATE_TIME_WINDOW_HOURS = 48


async def find_duplicate_candidate(
    db: AsyncSession, latitude: float, longitude: float, waste_type: str | None
) -> str | None:
    """
    Returns the id of a likely-duplicate existing complaint, or None.
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
    return str(row[0]) if row else None


async def count_nearby_reports(
    db: AsyncSession,
    latitude: float,
    longitude: float,
    radius_meters: int = 200,
    days: int = 30,
) -> int:
    """Count recent, non-duplicate complaints near the given coordinates."""
    query = text(
        """
        SELECT COUNT(*) FROM complaints
        WHERE status != 'duplicate'
          AND reported_at > now() - make_interval(days => :days)
          AND ST_DWithin(
                location,
                ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                :radius
              )
        """
    )
    result = await db.execute(
        query,
        {
            "days": days,
            "lng": longitude,
            "lat": latitude,
            "radius": radius_meters,
        },
    )
    count = result.scalar_one_or_none()
    return int(count) if count is not None else 0
