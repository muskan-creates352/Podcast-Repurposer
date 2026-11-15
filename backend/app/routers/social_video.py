from fastapi import APIRouter, status, UploadFile, File, Form, HTTPException
from typing import Optional

from app.schemas.social_video import (
    SocialVideoImportRequest,
    SocialVideoAnalysisResponse,
    SocialVideoChatRequest,
    SocialVideoChatResponse,
)
from app.services.social_video_service import (
    analyze_social_video_content,
    chat_with_social_video,
)

router = APIRouter(prefix="/social-video", tags=["Social Video Analyzer"])


@router.post("/analyze", response_model=SocialVideoAnalysisResponse, status_code=status.HTTP_200_OK)
def analyze_video(req: SocialVideoImportRequest):
    """
    Analyzes an Instagram Reel URL, YouTube Shorts URL, or uploaded video metadata.
    Returns 3-5 sentence overview, main topics, 3-tier summaries, discussion points,
    key takeaways, spoken quotes with timestamps, main message, educational terms,
    and visual frame insights.
    """
    return analyze_social_video_content(url=req.url or "", title=req.title or "", platform=req.platform)


@router.post("/chat", response_model=SocialVideoChatResponse, status_code=status.HTTP_200_OK)
def chat_video(req: SocialVideoChatRequest):
    """
    Answers questions about the video in English, Hindi, or Hinglish,
    with source timestamp citations.
    """
    return chat_with_social_video(req)
