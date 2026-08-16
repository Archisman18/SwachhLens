import uuid
from datetime import datetime

from sqlalchemy import String, Float, Numeric, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    photo_url: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    waste_type: Mapped[str | None] = mapped_column(
        SAEnum(
            "overflowing_bin", "illegal_dump", "plastic_waste", "construction_debris",
            "organic_waste", "e_waste", "hazardous_waste", "drain_blockage", "other",
            name="waste_type",
        ),
        nullable=True,
    )
    volume_bucket: Mapped[str | None] = mapped_column(
        SAEnum("small", "medium", "large", "very_large", name="volume_bucket"), nullable=True
    )
    status: Mapped[str] = mapped_column(
        SAEnum("reported", "assigned", "cleaned", "verified", "duplicate", name="complaint_status"),
        default="reported",
    )
    urgency: Mapped[str | None] = mapped_column(
        SAEnum("low", "medium", "high", "critical", name="urgency_level"), nullable=True
    )

    priority_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    assigned_team: Mapped[str | None] = mapped_column(String, nullable=True)
    assigned_vehicle: Mapped[str | None] = mapped_column(String, nullable=True)
    duplicate_of: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=True
    )

    reported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    # NOTE: the `location` GEOGRAPHY column is DB-generated (see db/schema.sql)
    # and intentionally not mapped here - query it with raw SQL (see
    # services/duplicate_detector.py) rather than through the ORM.
