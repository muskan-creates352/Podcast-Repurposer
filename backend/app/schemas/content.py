from typing import Any, Optional, Literal
from pydantic import BaseModel, ConfigDict


ContentType = Literal["blog", "social", "show_notes"]


class GeneratedContentResponse(BaseModel):
    """
    Exact API Contract:
    GeneratedContent: { id, episode_id, type, body, source_timestamps, status }
    """
    id: int
    episode_id: int
    type: str
    body: str
    source_timestamps: Optional[Any] = None
    status: str

    model_config = ConfigDict(from_attributes=True)
