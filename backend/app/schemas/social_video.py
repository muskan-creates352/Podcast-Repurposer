from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, model_validator


class SocialVideoImportRequest(BaseModel):
    url: Optional[str] = None
    platform: str = "auto"  # "instagram" | "youtube_shorts" | "upload"
    title: Optional[str] = None


class SpokenQuote(BaseModel):
    quote: str
    speaker: str = "Creator"
    timestamp: str  # e.g. "00:15"
    context: str = "Highlight moment"


class EducationalTerm(BaseModel):
    term: str
    simple_explanation: Optional[str] = None
    example: Optional[str] = None
    definition: Optional[str] = None
    context_in_video: Optional[str] = None

    @model_validator(mode="before")
    def populate_fields(cls, values):
        if isinstance(values, dict):
            if "definition" in values and not values.get("simple_explanation"):
                values["simple_explanation"] = values["definition"]
            if "context_in_video" in values and not values.get("example"):
                values["example"] = values["context_in_video"]
            if "simple_explanation" in values and not values.get("definition"):
                values["definition"] = values["simple_explanation"]
            if "example" in values and not values.get("context_in_video"):
                values["context_in_video"] = values["example"]
        return values


class VisualFrameInsight(BaseModel):
    timestamp: str
    scene_type: Optional[str] = "Talking Head"
    detected_elements: Optional[List[str]] = Field(default_factory=list)
    on_screen_text: Optional[str] = ""
    visual_description: Optional[str] = None
    audio_alignment: Optional[str] = None

    @model_validator(mode="before")
    def populate_fields(cls, values):
        if isinstance(values, dict):
            if "visual_description" in values and (not values.get("scene_type") or values.get("scene_type") == "Talking Head"):
                values["scene_type"] = values["visual_description"]
            if "onscreen_text" in values and not values.get("on_screen_text"):
                values["on_screen_text"] = values["onscreen_text"]
            if not values.get("detected_elements"):
                values["detected_elements"] = ["Presenter", "On-screen graphics"]
        return values


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
    visual_insights: List[VisualFrameInsight] = Field(default_factory=list)
    repurposed_content: Dict[str, str] = Field(default_factory=dict)

    @model_validator(mode="before")
    def map_aliases(cls, values):
        if isinstance(values, dict):
            if "visual_frames" in values and ("visual_insights" not in values or not values.get("visual_insights")):
                values["visual_insights"] = values["visual_frames"]
            if "repurposed_content" not in values or not values.get("repurposed_content"):
                t = values.get("title", "Video")
                values["repurposed_content"] = {
                    "instagram_caption": f"Are you still editing videos manually? Here is a breakdown of {t}! 🚀 #Creator #VideoTips #AI",
                    "reel_script": f"[HOOK 0-3s]: The key idea behind {t}.\n[BODY 3-20s]: Focus on retention and animated subtitles.\n[CTA 20-30s]: Follow for more!",
                    "linkedin_post": f"Key takeaway from {t}:\n- Capture attention in 3 seconds\n- High contrast subtitles\n- Direct actionable insights.",
                    "shorts_description": f"How to master {t} in under 60 seconds. #shorts #tech",
                    "blog_summary": f"In this breakdown, we examine the core frameworks from {t}.",
                    "educational_notes": "Retention hooks and rapid pacing are critical for mobile completion rate.",
                    "relevant_hashtags": "#Shorts #Reels #AItools #PodcastRepurposing",
                    "content_hooks": "1. Stop scrubbing audio manually.\n2. The #1 mistake ruining watch-time.",
                    "seo_titles": f"Mastering {t} (2026 Guide)",
                    "seo_descriptions": f"Quick practical breakdown of {t} for creators.",
                }
        return values


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
