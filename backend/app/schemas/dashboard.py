from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class ActivityItem(BaseModel):
    id: str
    action: str
    target: str
    time: str
    status: str
    type: str  # 'podcast' | 'clip' | 'content' | 'video'


class StatsResponse(BaseModel):
    """
    Dashboard Overview Metrics
    """
    total_episodes: int
    videos_imported: int = 18
    clips_generated: int
    pending_reviews: int
    avg_processing_time: float
    recent_activities: List[ActivityItem] = []

    model_config = ConfigDict(from_attributes=True)


class WeeklyEpisodeItem(BaseModel):
    week: str
    count: int

    model_config = ConfigDict(from_attributes=True)
