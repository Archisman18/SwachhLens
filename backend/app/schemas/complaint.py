import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ComplaintCreate(BaseModel):
    photo_url: str
    latitude: float
    longitude: float
    comment: Optional[str] = None
    citizen_name: Optional[str] = None
    citizen_phone: Optional[str] = None
    citizen_email: Optional[str] = None


class ComplaintAssign(BaseModel):
    assigned_team: str
    assigned_vehicle: Optional[str] = None


class ComplaintStatusUpdate(BaseModel):
    status: str  # reported | assigned | cleaned | verified | duplicate
    resolution_photo_url: Optional[str] = None


class ComplaintOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    photo_url: str
    latitude: float
    longitude: float
    comment: Optional[str]
    waste_type: Optional[str]
    volume_bucket: Optional[str]
    status: str
    urgency: Optional[str]
    priority_score: float
    assigned_team: Optional[str]
    assigned_vehicle: Optional[str]
    duplicate_of: Optional[uuid.UUID]
    resolution_photo_url: Optional[str]
    citizen_name: Optional[str] = None
    citizen_phone: Optional[str] = None
    citizen_email: Optional[str] = None
    reported_at: datetime
    updated_at: datetime
