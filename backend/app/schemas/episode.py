from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, Field


EpisodeStatus = Literal[
    "uploaded",
    "transcribing",
    "processing",
    "ready_for_review",
    "published",
]


class EpisodeBase(BaseModel):
    title: str


class EpisodeCreate(EpisodeBase):
    pass


class EpisodeResponse(BaseModel):
    """
    Exact API Contract:
    Episode: { id, title, status, duration, created_at, progress }
    """
    id: int
    title: str
    status: str
    duration: float
    created_at: datetime
    progress: int

    model_config = ConfigDict(from_attributes=True)
