from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.youtube_service import (
    extract_youtube_video_id,
    fetch_youtube_metadata,
    process_youtube_import,
)

router = APIRouter(prefix="/youtube", tags=["YouTube Import"])


class YouTubeValidateRequest(BaseModel):
    url: str


class YouTubeImportRequest(BaseModel):
    url: str
    language: Optional[str] = "en"


@router.post("/validate")
def validate_youtube_url(req: YouTubeValidateRequest):
    """
    Validates a YouTube URL and fetches its authentic metadata (Title, Channel, Thumbnail)
    via official oEmbed and yt-dlp. Never returns unrelated placeholder data.
    """
    video_id = extract_youtube_video_id(req.url)
    if not video_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid YouTube URL. Please provide a standard watch link, youtu.be link, or YouTube Shorts link.",
        )

    meta = fetch_youtube_metadata(video_id)
    return {
        "valid": True,
        "video_id": video_id,
        "metadata": meta,
    }


@router.post("/import")
def import_youtube_podcast(
    req: YouTubeImportRequest,
    db: Session = Depends(get_db),
):
    """
    Imports a YouTube video or podcast:
    1. Validates URL and fetches real metadata.
    2. Retrieves real captions/transcript from YouTube.
    3. If captions unavailable, returns 422 with clear message and direct upload alternative.
    4. Repurposes transcript through Groq Cloud (summaries, topics, takeaways, clips, blog).
    5. Creates a real episode record in the database.
    """
    result = process_youtube_import(db=db, url=req.url, language=req.language or "en")
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=result.get("error", "Failed to import YouTube video."),
        )
    return result
