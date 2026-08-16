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
          AND reported_at > now() - (:hours || ' hours')::interval
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
