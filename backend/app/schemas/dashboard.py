from typing import List
from pydantic import BaseModel, ConfigDict


class StatsResponse(BaseModel):
    """
    Exact API Contract:
    Stats: { total_episodes, clips_generated, pending_reviews, avg_processing_time }
    """
    total_episodes: int
    clips_generated: int
    pending_reviews: int
    avg_processing_time: float

    model_config = ConfigDict(from_attributes=True)


class WeeklyEpisodeItem(BaseModel):
    week: str
    count: int

    model_config = ConfigDict(from_attributes=True)
