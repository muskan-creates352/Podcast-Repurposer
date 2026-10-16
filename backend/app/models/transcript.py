from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    episode_id = Column(Integer, ForeignKey("episodes.id", ondelete="CASCADE"), nullable=False, unique=True)
    language = Column(String(20), default="en", nullable=False)
    raw_text = Column(Text, nullable=False)
    # segments stores JSON list: [{"start": float, "end": float, "speaker": str, "text": str}]
    segments = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    episode = relationship("Episode", back_populates="transcript")
