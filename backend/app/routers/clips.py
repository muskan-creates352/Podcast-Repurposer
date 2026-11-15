import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

from app.schemas.clip_export import ClipExportRequest, ClipExportResponse
from app.services.ffmpeg_service import render_clip_with_ffmpeg, EXPORTS_DIR

router = APIRouter(tags=["Clips & Export"])


@router.post("/clips/export", response_model=ClipExportResponse, status_code=status.HTTP_200_OK)
def export_clip(req: ClipExportRequest):
    """
    Renders an actual MP4 video clip with specified aspect ratio (9:16, 16:9, 1:1),
    burned-in styled subtitles, and timing using system FFmpeg.
    """
    return render_clip_with_ffmpeg(req)


@router.get("/exports/{filename}")
def download_export(filename: str):
    """
    Serves the actual exported MP4 video file for direct preview or browser download.
    """
    file_path = EXPORTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exported video file {filename} not found",
        )
    return FileResponse(
        path=str(file_path),
        media_type="video/mp4",
        filename=filename,
    )
