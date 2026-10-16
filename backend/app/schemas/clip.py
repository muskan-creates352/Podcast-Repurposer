from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict


ClipStatus = Literal["pending", "approved", "rejected"]


class ClipResponse(BaseModel):
    """
    Exact API Contract:
    Clip: { id, episode_id, start_time, end_time, text, reason, status }
    """
    id: int
    episode_id: int
    start_time: float
    end_time: float
    text: str
    reason: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True)
