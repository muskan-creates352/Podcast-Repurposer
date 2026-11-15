from typing import List, Optional, Union, Any, Dict
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
    avg_processing_time: Union[float, str]
    recent_activities: List[ActivityItem] = []

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

    model_config = ConfigDict(from_attributes=True)
