import os
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
    process_uploaded_social_video,
    chat_with_social_video,
)
from app.core.config import settings

router = APIRouter(prefix="/social-video", tags=["Social Video Analyzer"])


@router.post("/analyze", response_model=SocialVideoAnalysisResponse, status_code=status.HTTP_200_OK)
def analyze_video(req: SocialVideoImportRequest):
    """
    Analyzes an Instagram Reel URL, YouTube Shorts URL, or video metadata.
    Returns 3-5 sentence overview, main topics, 3-tier summaries, discussion points,
    key takeaways, spoken quotes with timestamps, main message, educational terms,
    and visual frame insights.
    """
    return analyze_social_video_content(url=req.url or "", title=req.title or "", platform=req.platform)


@router.post("/upload", response_model=SocialVideoAnalysisResponse, status_code=status.HTTP_200_OK)
def upload_and_analyze_video(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    language: Optional[str] = Form("en"),
):
    """
    Uploads an MP4/MOV video directly, extracts audio via FFmpeg,
    runs Groq Whisper speech transcription and AI video breakdown.
    """
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    saved_path = os.path.join(settings.UPLOAD_DIR, f"social_{file.filename}")
    
    with open(saved_path, "wb") as f:
        content = file.file.read()
        f.write(content)

    video_title = title.strip() if title else os.path.splitext(file.filename)[0]
    return process_uploaded_social_video(file_path=saved_path, title=video_title, language=language or "en")


@router.post("/chat", response_model=SocialVideoChatResponse, status_code=status.HTTP_200_OK)
def chat_video(req: SocialVideoChatRequest):
    """
    Answers questions about the video in English, Hindi, or Hinglish,
    with source timestamp citations.
    """
    return chat_with_social_video(req)
