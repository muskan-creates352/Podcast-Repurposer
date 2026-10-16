from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, Text, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Clip(Base):
    """
    Clip Model.
    Status values: pending | approved | rejected
    """
    __tablename__ = "clips"

    id = Column(Integer, primary_key=True, index=True)
    episode_id = Column(Integer, ForeignKey("episodes.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    text = Column(Text, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(50), default="pending", nullable=False)  # pending | approved | rejected
    score = Column(Float, default=1.0, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    episode = relationship("Episode", back_populates="clips")
