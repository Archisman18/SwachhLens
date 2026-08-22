from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select, func, cast, Date
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


@router.get("/analytics")
async def get_analytics(db: AsyncSession = Depends(get_db)):
    """
    Aggregated stats for the admin dashboard:
    - Complaint counts by waste_type
    - Complaint counts by status
    - Per-day trend over the last 30 days

    Uses plain SQL aggregation — works on both SQLite and Postgres.
    """
    # ── By waste_type ────────────────────────────────────────────
    wt_query = (
        select(Complaint.waste_type, func.count(Complaint.id))
        .group_by(Complaint.waste_type)
    )
    wt_result = await db.execute(wt_query)
    by_waste_type = {
        (wt or "unclassified"): count
        for wt, count in wt_result.all()
    }

    # ── By status ────────────────────────────────────────────────
    st_query = (
        select(Complaint.status, func.count(Complaint.id))
        .group_by(Complaint.status)
    )
    st_result = await db.execute(st_query)
    by_status = {status: count for status, count in st_result.all()}

    # ── Daily trend (last 30 days) ──────────────────────────────
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    trend_query = (
        select(
            cast(Complaint.reported_at, Date).label("date"),
            func.count(Complaint.id).label("count"),
        )
        .where(Complaint.reported_at >= cutoff)
        .group_by(cast(Complaint.reported_at, Date))
        .order_by(cast(Complaint.reported_at, Date))
    )
    trend_result = await db.execute(trend_query)
    daily_trend = [
        {"date": str(row.date), "count": row.count}
        for row in trend_result.all()
    ]

    return {
        "by_waste_type": by_waste_type,
        "by_status": by_status,
        "daily_trend": daily_trend,
    }
