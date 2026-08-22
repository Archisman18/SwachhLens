from collections import Counter
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
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
        select(Complaint.reported_at)
        .where(Complaint.reported_at >= cutoff)
        .order_by(Complaint.reported_at)
    )
    trend_result = await db.execute(trend_query)
    counts = Counter()
    for (rep_at,) in trend_result.all():
        if rep_at:
            d_str = rep_at.strftime("%Y-%m-%d") if hasattr(rep_at, "strftime") else str(rep_at)[:10]
            counts[d_str] += 1

    daily_trend = [
        {"date": d, "count": c}
        for d, c in sorted(counts.items())
    ]

    return {
        "by_waste_type": by_waste_type,
        "by_status": by_status,
        "daily_trend": daily_trend,
    }
