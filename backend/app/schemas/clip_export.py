from typing import Optional
from pydantic import BaseModel


class ClipExportRequest(BaseModel):
    clip_id: str
    title: str = "Viral Highlight Clip"
    aspect_ratio: str = "9:16"  # "9:16" | "16:9" | "1:1"
    start_time: float = 0.0
    end_time: float = 30.0
    caption_text: Optional[str] = None
    font_size: int = 24
    font_color: str = "white"
    position: str = "bottom"  # "bottom" | "center" | "top"


class ClipExportResponse(BaseModel):
    status: str
    clip_id: str
    download_url: str
    filename: str
    aspect_ratio: str
    duration: float
    message: str
