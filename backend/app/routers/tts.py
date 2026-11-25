import re
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.services.elevenlabs_service import (
    synthesize_podcast_speech,
    get_elevenlabs_credentials,
    CACHE_DIR,
)

router = APIRouter(prefix="/tts", tags=["Text-to-Speech (ElevenLabs)"])


class SynthesizeRequest(BaseModel):
    text: str = Field(..., description="The raw podcast or summary text to synthesize")
    voice_id: Optional[str] = Field(None, description="ElevenLabs voice ID override")
    model_id: Optional[str] = Field(None, description="ElevenLabs model ID override")
    title: Optional[str] = Field(None, description="Optional title or context")


class SynthesizeResponse(BaseModel):
    status: str
    audio_url: Optional[str] = None
    cache_key: Optional[str] = None
    duration_estimated_seconds: int = 120
    voice_used: Optional[str] = None
    model_used: Optional[str] = None
    engine: str = "elevenlabs"
    is_cached: bool = False
    message: Optional[str] = None
    cleaned_text: str


@router.post("/synthesize", response_model=SynthesizeResponse, status_code=status.HTTP_200_OK)
def synthesize_speech(req: SynthesizeRequest):
    """
    Centralized ElevenLabs TTS endpoint:
    - Normalizes text (removes timestamps, markdown, URLs)
    - Checks persistent SHA-256 MP3 disk cache
    - Generates natural, human-like voice narration using ElevenLabs
    - Returns cached audio URL or clean browser fallback state.
    """
    if not req.text or not req.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Narration text cannot be empty.",
        )

    result = synthesize_podcast_speech(
        text=req.text,
        voice_id=req.voice_id,
        model_id=req.model_id,
    )
    return SynthesizeResponse(**result)


@router.get("/audio/{filename}")
def get_cached_audio(filename: str):
    """
    Serves cached ElevenLabs MP3 audio with security validation against path traversal.
    """
    # Strict regex check for SHA-256 hash filename
    if not re.match(r"^[a-f0-9]{64}\.mp3$", filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid audio filename format.",
        )

    file_path = CACHE_DIR / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio file not found or expired.",
        )

    return FileResponse(
        path=str(file_path),
        media_type="audio/mpeg",
        headers={"Accept-Ranges": "bytes", "Cache-Control": "public, max-age=604800"},
    )


@router.get("/status")
def get_tts_status():
    """
    Reports ElevenLabs service configuration status without exposing secrets.
    """
    api_key, voice_id, model_id = get_elevenlabs_credentials()
    has_key = bool(api_key and len(api_key) > 5)

    return {
        "provider": "ElevenLabs",
        "configured": has_key,
        "default_voice_id": voice_id,
        "model_id": model_id,
        "fallback_available": True,
        "cache_directory": str(CACHE_DIR),
    }
