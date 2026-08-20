import uuid
from datetime import datetime

from sqlalchemy import String, Float, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    photo_url: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    waste_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    volume_bucket: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="reported")
    urgency: Mapped[str | None] = mapped_column(String(20), nullable=True)

    priority_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    assigned_team: Mapped[str | None] = mapped_column(String, nullable=True)
    assigned_vehicle: Mapped[str | None] = mapped_column(String, nullable=True)
    duplicate_of: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("complaints.id"), nullable=True
    )

    reported_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime)
