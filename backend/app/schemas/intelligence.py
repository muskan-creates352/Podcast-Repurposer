from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ConversationalOverviewResponse(BaseModel):
    """
    Phase 6: Listen to Episode Overview.
    A natural, conversational narrative of the entire episode
    grounded directly in the actual podcast transcript.
    """
    episode_id: int
    episode_title: str
    conversational_script: str = Field(..., description="Conversational script for reading or listening")
    what_episode_is_about: str
    topics_discussed: List[str]
    speaker_explanations: List[str]
    important_arguments: List[str]
    examples_and_stories: List[str]
    key_insights: List[str]
    conclusions: str
    most_useful_takeaway: str
    estimated_listen_duration_seconds: int = 180


class PodcastBriefResponse(BaseModel):
    """
    Phase 8: Podcast Brief.
    Organized, actionable brief containing quotes, resources, and takeaways.
    """
    episode_id: int
    episode_title: str
    main_topic: str
    short_summary: str
    key_takeaways: List[str]
    topics_discussed: List[str]
    actionable_insights: List[str]
    important_timestamps: List[Dict[str, Any]]
    key_quotes: List[Dict[str, str]]
    mentioned_tools_and_resources: List[str]
    conclusion: str


class AudienceModeResponse(BaseModel):
    """
    Phase 9: Audience Mode.
    Adapts explanation depth, language, and context to the listener's profile.
    """
    episode_id: int
    mode: str = Field(..., description="beginner | student | developer | professional | quick_summary")
    title: str
    explanation: str
    key_concepts: List[str]
    practical_implication: str


class VocabularyTerm(BaseModel):
    """
    Phase 10: AI Vocabulary Extractor.
    Technical or unfamiliar terms used in the podcast.
    """
    term: str
    simple_meaning: str
    contextual_explanation: str
    example: str
    timestamp: Optional[str] = None
    start_seconds: Optional[float] = None


class VocabularyResponse(BaseModel):
    episode_id: int
    total_terms: int
    terms: List[VocabularyTerm]


class TimelineSegment(BaseModel):
    """
    Phase 11: Smart Podcast Timeline.
    Visual segments with categories and exact timestamps.
    """
    category: str = Field(..., description="Introduction | Story | Important Insight | Example | Debate | Advice | Conclusion")
    title: str
    timestamp: str
    start_seconds: float
    end_seconds: float
    short_explanation: str


class TimelineResponse(BaseModel):
    episode_id: int
    segments: List[TimelineSegment]
