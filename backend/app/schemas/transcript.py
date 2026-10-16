from typing import List
from pydantic import BaseModel, ConfigDict


class TranscriptSegment(BaseModel):
    start: float
    end: float
    speaker: str
    text: str

    model_config = ConfigDict(from_attributes=True)


class TranscriptResponse(BaseModel):
    episode_id: int
    language: str = "en"
    raw_text: str
    segments: List[TranscriptSegment]

    model_config = ConfigDict(from_attributes=True)
