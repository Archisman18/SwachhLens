from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.complaint import Complaint
from app.schemas.complaint import ComplaintOut

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/hotspots", response_model=list[ComplaintOut])
async def get_hotspots(db: AsyncSession = Depends(get_db)):
    """
    Feed for the admin map. For MVP this just returns active complaints
    with lat/lng - the frontend clusters them into a heat layer.
    TODO: consider a dedicated aggregation query (grid-based clustering)
    once volume grows.
    """
    query = select(Complaint).where(Complaint.status != "duplicate")
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/queue", response_model=list[ComplaintOut])
async def get_priority_queue(db: AsyncSession = Depends(get_db)):
    """Priority-sorted, unresolved complaints for the authority queue view."""
    query = (
        select(Complaint)
        .where(Complaint.status.in_(["reported", "assigned"]))
        .order_by(Complaint.priority_score.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()
