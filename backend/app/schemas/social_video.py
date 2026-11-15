from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SocialVideoImportRequest(BaseModel):
    url: Optional[str] = None
    platform: str = "auto"  # "instagram" | "youtube_shorts" | "upload"
    title: Optional[str] = None


class SpokenQuote(BaseModel):
    quote: str
    speaker: str = "Creator"
    timestamp: str  # e.g. "00:15"
    context: str


class EducationalTerm(BaseModel):
    term: str
    simple_explanation: str
    example: str


class VisualFrameInsight(BaseModel):
    timestamp: str
    scene_type: str
    detected_elements: List[str]
    on_screen_text: str


class SocialVideoAnalysisResponse(BaseModel):
    video_id: str
    title: str
    platform: str
    duration: str
    thumbnail_url: str
    explanation_3_5_sentences: str
    main_message: str
    main_topics: List[str]
    summary_30s: str
    summary_detailed: str
    summary_beginner: str
    discussion_points: List[str]
    key_takeaways: List[str]
    spoken_quotes: List[SpokenQuote]
    educational_terms: List[EducationalTerm]
    visual_insights: List[VisualFrameInsight]
    repurposed_content: Dict[str, str]


class SocialVideoChatRequest(BaseModel):
    video_id: str
    message: str
    language: str = "english"  # "english" | "hindi" | "hinglish"
    history: Optional[List[Dict[str, str]]] = None


class SocialVideoChatResponse(BaseModel):
    video_id: str
    reply: str
    language: str
    cited_timestamp: Optional[str] = None
