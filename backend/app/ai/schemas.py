from typing import List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Transcription Schemas
# ---------------------------------------------------------------------------
class AudioSegmentItem(BaseModel):
    start: float = Field(..., description="Start time in seconds")
    end: float = Field(..., description="End time in seconds")
    speaker: str = Field(..., description="Speaker label, e.g. Speaker 1 (Host)")
    text: str = Field(..., description="Spoken transcript text for this segment")
    confidence: float = Field(default=0.95, ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")


class TranscriptionResult(BaseModel):
    language: str = Field(default="en", description="Detected language code")
    segments: List[AudioSegmentItem] = Field(..., description="List of timestamped speaker turns")
    raw_text: str = Field(..., description="Full concatenated transcript text")


# ---------------------------------------------------------------------------
# Highlight Agent Schemas (3 clips with start_time, end_time, text, score)
# ---------------------------------------------------------------------------
class HighlightClipItem(BaseModel):
    start_time: float = Field(..., description="Start timestamp of the clip in seconds")
    end_time: float = Field(..., description="End timestamp of the clip in seconds")
    text: str = Field(..., description="Exact quote or spoken excerpt from transcript")
    score: float = Field(default=0.9, ge=0.0, le=1.0, description="Viral/importance score between 0.0 and 1.0")
    reason: Optional[str] = Field(default=None, description="Optional brief rationale")


class HighlightAgentOutput(BaseModel):
    clips: List[HighlightClipItem] = Field(..., min_length=1, max_length=5, description="Top highlight moments extracted from transcript")


# ---------------------------------------------------------------------------
# Content Agent Schemas (blog draft, 3 social captions, show notes)
# ---------------------------------------------------------------------------
class ContentAgentOutput(BaseModel):
    blog_draft: str = Field(..., description="Structured markdown blog article draft with headings and key takeaways")
    blog_timestamps: List[str] = Field(..., description="Timestamps cited in blog draft, e.g. ['00:14 - 00:42']")
    social_captions: List[str] = Field(..., min_length=1, max_length=5, description="List of social media captions (e.g. 3 punchy posts or thread)")
    social_timestamps: List[str] = Field(..., description="Timestamps cited for social captions")
    show_notes: str = Field(..., description="Episode show notes with chapter timestamps and key topics")
    show_notes_timestamps: List[str] = Field(..., description="Timestamps cited in show notes")


# ---------------------------------------------------------------------------
# Explanation Agent Schemas (rationale for each clip citing timestamps)
# ---------------------------------------------------------------------------
class ClipExplanationItem(BaseModel):
    clip_index: int = Field(..., description="Index of the clip (0-indexed)")
    reason: str = Field(..., description="2-3 sentence explanation of why this moment was selected")
    cited_timestamp: str = Field(..., description="Specific transcript timestamp cited, e.g. '00:14 - 00:42'")


class ExplanationAgentOutput(BaseModel):
    explanations: List[ClipExplanationItem] = Field(..., description="Explanations corresponding to each extracted clip")
