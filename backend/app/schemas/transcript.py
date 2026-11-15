from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class TranscriptSegment(BaseModel):
    start: float
    end: float
    speaker: str
    text: str
    confidence: Optional[float] = 1.0
    low_confidence: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)


class TranscriptResponse(BaseModel):
    episode_id: int
    language: str = "en"
    raw_text: str
    segments: List[TranscriptSegment]
    low_confidence: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)
