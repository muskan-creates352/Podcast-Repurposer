from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class GeneratedContent(Base):
    """
    GeneratedContent Model.
    type values: blog | social | show_notes
    status values: pending | approved | rejected
    """
    __tablename__ = "generated_contents"

    id = Column(Integer, primary_key=True, index=True)
    episode_id = Column(Integer, ForeignKey("episodes.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # blog | social | show_notes
    body = Column(Text, nullable=False)
    source_timestamps = Column(JSON, nullable=True)  # List or dict of cited timestamps e.g. ["00:15 - 01:20"]
    status = Column(String(50), default="pending", nullable=False)  # pending | approved | rejected
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    episode = relationship("Episode", back_populates="contents")
