from typing import List, Optional, Union
from pydantic import BaseModel, ConfigDict


class StatsResponse(BaseModel):
    """
    Exact API Contract:
    Stats: { total_episodes, clips_generated, pending_reviews, avg_processing_time }
    """
    total_episodes: int
    clips_generated: int
    pending_reviews: int
    avg_processing_time: Union[float, str]

    model_config = ConfigDict(from_attributes=True)


class WeeklyEpisodeItem(BaseModel):
    week: str
    count: int
    episodes: Optional[int] = 0
    clips: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class AgentStatusItem(BaseModel):
    id: str
    name: str
    description: str
    status: str  # idle | running | completed | waiting
    currentTask: Optional[str] = None
    lastActive: str
    latency: str
