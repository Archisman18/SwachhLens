import uuid
from datetime import datetime

from sqlalchemy import String, Float, Numeric, DateTime, ForeignKey, Text, Uuid, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.core.config import settings
from app.core.database import Base

_is_sqlite = settings.database_url.startswith("sqlite")

id_type = String(36) if _is_sqlite else Uuid(as_uuid=False)

waste_type_type = String(30) if _is_sqlite else SQLEnum(
    'overflowing_bin', 'illegal_dump', 'plastic_waste', 'construction_debris',
    'organic_waste', 'e_waste', 'hazardous_waste', 'drain_blockage', 'other',
    name='waste_type',
    create_type=False,
    native_enum=True,
)

volume_bucket_type = String(20) if _is_sqlite else SQLEnum(
    'small', 'medium', 'large', 'very_large',
    name='volume_bucket',
    create_type=False,
    native_enum=True,
)

status_type = String(20) if _is_sqlite else SQLEnum(
    'reported', 'assigned', 'cleaned', 'verified', 'duplicate',
    name='complaint_status',
    create_type=False,
    native_enum=True,
)

urgency_type = String(20) if _is_sqlite else SQLEnum(
    'low', 'medium', 'high', 'critical',
    name='urgency_level',
    create_type=False,
    native_enum=True,
)


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[str] = mapped_column(id_type, primary_key=True, default=lambda: str(uuid.uuid4()))
    photo_url: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    waste_type: Mapped[str | None] = mapped_column(waste_type_type, nullable=True)
    volume_bucket: Mapped[str | None] = mapped_column(volume_bucket_type, nullable=True)
    status: Mapped[str] = mapped_column(status_type, default="reported")
    urgency: Mapped[str | None] = mapped_column(urgency_type, nullable=True)

    priority_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    assigned_team: Mapped[str | None] = mapped_column(String, nullable=True)
    assigned_vehicle: Mapped[str | None] = mapped_column(String, nullable=True)
    duplicate_of: Mapped[str | None] = mapped_column(
        id_type, ForeignKey("complaints.id"), nullable=True
    )
    resolution_photo_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    citizen_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    citizen_phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    citizen_email: Mapped[str | None] = mapped_column(String(100), nullable=True)

    reported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
