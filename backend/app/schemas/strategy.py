from typing import List, Optional
from pydantic import BaseModel, Field


class StrategyRecommendationItem(BaseModel):
    format: str = Field(..., description="Content format, e.g. LinkedIn Post, Instagram Carousel, Short-form Video, X Thread, Newsletter, Blog, YouTube Description")
    topic: str = Field(..., description="Specific sub-topic or theme addressed")
    reason: str = Field(..., description="Why this format was recommended for this specific segment")
    target_audience: str = Field(..., description="Primary audience (e.g. Founders, Engineers, Content Creators)")
    suggested_hook: str = Field(..., description="Opening hook or headline")
    key_message: str = Field(..., description="Core takeaway to communicate")
    content_potential: str = Field(..., description="Engagement potential (High Viral, High Engagement, Thought Leadership, SEO Anchor)")
    suggested_timestamps: Optional[str] = Field(None, description="Audio timestamp range from transcript")


class StrategyResponse(BaseModel):
    episode_id: int
    episode_title: str
    total_recommendations: int
    recommendations: List[StrategyRecommendationItem]
