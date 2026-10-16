from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Episode(Base):
    """
    Episode Model.
    Status values: uploaded | transcribing | processing | ready_for_review | published
    Progress: 0 to 100 integer.
    """
    __tablename__ = "episodes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="uploaded", nullable=False)
    duration = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    progress = Column(Integer, default=0, nullable=False)

    # Storage and association metadata
    file_path = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    project = relationship("Project", back_populates="episodes")
    user = relationship("User", back_populates="episodes")
    transcript = relationship("Transcript", back_populates="episode", uselist=False, cascade="all, delete-orphan")
    clips = relationship("Clip", back_populates="episode", cascade="all, delete-orphan")
    contents = relationship("GeneratedContent", back_populates="episode", cascade="all, delete-orphan")
