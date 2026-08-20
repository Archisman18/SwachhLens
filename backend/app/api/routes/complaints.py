import httpx
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.complaint import Complaint
from app.schemas.complaint import (
    ComplaintCreate, ComplaintOut, ComplaintAssign, ComplaintStatusUpdate,
)
from app.services import (
    classifier, volume_estimator, duplicate_detector, priority_scorer, dispatch_recommender,
)

router = APIRouter(prefix="/complaints", tags=["complaints"])


@router.post("", response_model=ComplaintOut, status_code=201)
async def create_complaint(payload: ComplaintCreate, db: AsyncSession = Depends(get_db)):
    """
    Citizen submits a report. Runs the full AI pipeline: classify ->
    estimate volume -> check duplicate -> score priority -> recommend
    response.
    """
    now = datetime.now(timezone.utc)

    complaint = Complaint(
        id=str(uuid.uuid4()),
        photo_url=payload.photo_url,
        latitude=payload.latitude,
        longitude=payload.longitude,
        comment=payload.comment,
        status="reported",
        reported_at=now,
        updated_at=now,
    )

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            image_response = await client.get(payload.photo_url)
            image_response.raise_for_status()
            image_bytes = image_response.content

        waste_type, confidence = await classifier.classify_waste(image_bytes)
        volume_bucket = await volume_estimator.estimate_volume(image_bytes)

        complaint.waste_type = waste_type
        complaint.volume_bucket = volume_bucket
    except Exception as e:
        print(f"AI pipeline failed for {payload.photo_url}: {e}")

    duplicate_id = await duplicate_detector.find_duplicate_candidate(
        db, payload.latitude, payload.longitude, complaint.waste_type
    )
    if duplicate_id:
        complaint.status = "duplicate"
        complaint.duplicate_of = duplicate_id
    else:
        score = priority_scorer.compute_priority_score(complaint.volume_bucket)
        urgency = priority_scorer.urgency_from_score(score)
        recommendation = dispatch_recommender.recommend_response(
            complaint.waste_type, complaint.volume_bucket, urgency
        )
        complaint.priority_score = score
        complaint.urgency = urgency
        complaint.assigned_team = recommendation["team"]
        complaint.assigned_vehicle = recommendation["vehicle"]

    db.add(complaint)
    await db.commit()
    await db.refresh(complaint)
    return complaint


@router.get("", response_model=list[ComplaintOut])
async def list_complaints(status: str | None = None, db: AsyncSession = Depends(get_db)):
    """Priority-sorted complaint queue, optionally filtered by status."""
    query = select(Complaint).order_by(Complaint.priority_score.desc())
    if status:
        query = query.where(Complaint.status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{complaint_id}", response_model=ComplaintOut)
async def get_complaint(complaint_id: str, db: AsyncSession = Depends(get_db)):
    complaint = await db.get(Complaint, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.patch("/{complaint_id}/assign", response_model=ComplaintOut)
async def assign_complaint(
    complaint_id: str, payload: ComplaintAssign, db: AsyncSession = Depends(get_db)
):
    complaint = await db.get(Complaint, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.assigned_team = payload.assigned_team
    complaint.assigned_vehicle = payload.assigned_vehicle
    complaint.status = "assigned"
    await db.commit()
    await db.refresh(complaint)
    return complaint


@router.patch("/{complaint_id}/status", response_model=ComplaintOut)
async def update_status(
    complaint_id: str, payload: ComplaintStatusUpdate, db: AsyncSession = Depends(get_db)
):
    complaint = await db.get(Complaint, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.status = payload.status
    await db.commit()
    await db.refresh(complaint)
    return complaint
