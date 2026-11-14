from typing import List, Dict
from pydantic import BaseModel, ConfigDict
from app.schemas.dashboard import WeeklyEpisodeItem


class AnalyticsResponse(BaseModel):
    """
    Contract for GET /analytics:
    - approval_rate (percentage)
    - avg_processing_time (seconds)
    - content_types_generated (e.g. {'blog': 4, 'social': 12, 'show_notes': 4})
    - episodes_per_week
    - total_episodes
    - total_clips
    - pending_reviews
    """
    approval_rate: float
    avg_processing_time: float
    content_types_generated: Dict[str, int]
    episodes_per_week: List[WeeklyEpisodeItem]
    total_episodes: int
    total_clips: int
    pending_reviews: int

    model_config = ConfigDict(from_attributes=True)
