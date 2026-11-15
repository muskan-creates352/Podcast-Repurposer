from typing import List, Optional
from pydantic import BaseModel, Field


class PodcastSpeaker(BaseModel):
    name: str
    role: str
    key_viewpoint: str


class PodcastOverview(BaseModel):
    podcast_title: str
    explanation: str
    purpose: str
    central_idea: str
    subjects_covered: List[str]
    speakers: List[PodcastSpeaker]


class TopicItem(BaseModel):
    id: str
    name: str
    explanation: str
    timestamp: str  # e.g. "04:12"
    start_seconds: float
    important_points: List[str]
    related_segments: List[str]


class Summaries(BaseModel):
    summary_30s: str
    summary_1m: str
    summary_detailed: str
    five_takeaways: List[str]


class SmartChapter(BaseModel):
    chapter_number: int
    title: str
    start_time: str  # e.g. "00:00"
    end_time: str    # e.g. "04:12"
    start_seconds: float
    end_seconds: float
    explanation: str
    key_points: List[str]


class KeyTakeaway(BaseModel):
    id: str
    lesson: str
    category: str
    practical_advice: str
    timestamp: str


class InsightsResponse(BaseModel):
    episode_id: int
    episode_title: str
    duration: float
    overview: PodcastOverview
    summaries: Summaries
    topics: List[TopicItem]
    chapters: List[SmartChapter]
    takeaways: List[KeyTakeaway]
