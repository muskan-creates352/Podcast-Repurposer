import os
import re
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.episode import Episode
from app.models.transcript import Transcript
from app.services.groq_service import (
    get_groq_status,
    chat_with_podcast_groq,
    GROQ_TEXT_MODEL,
    GROQ_WHISPER_MODEL,
)

router = APIRouter(prefix="/groq", tags=["Groq Cloud AI"])


class GroqConfigRequest(BaseModel):
    api_key: str


class GroqChatRequest(BaseModel):
    episode_id: int
    message: str
    language: Optional[str] = "en"
    chat_history: Optional[List[Dict[str, str]]] = None


@router.get("/status")
def check_groq_health():
    """
    Checks Groq Cloud API connectivity and model availability.
    """
    return get_groq_status()


@router.post("/config")
def update_groq_key(req: GroqConfigRequest):
    """
    Dynamically configures or updates the GROQ_API_KEY in memory and writes to .env.
    """
    new_key = req.api_key.strip()
    if not new_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="API key cannot be empty.",
        )

    # Update in memory
    settings.GROQ_API_KEY = new_key

    # Update backend/.env file
    env_path = ".env"
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                content = f.read()
            if "GROQ_API_KEY=" in content:
                content = re.sub(r"GROQ_API_KEY=.*", f"GROQ_API_KEY={new_key}", content)
            else:
                content += f"\nGROQ_API_KEY={new_key}\n"
            with open(env_path, "w", encoding="utf-8") as f:
                f.write(content)
        except Exception as e:
            pass

    return get_groq_status()


@router.post("/chat")
def chat_with_episode(
    req: GroqChatRequest,
    db: Session = Depends(get_db),
):
    """
    Interactive RAG Chatbot grounded in the episode's actual transcript.
    Answers in English, Hindi, or Hinglish with timestamp citations.
    """
    episode = db.query(Episode).filter(Episode.id == req.episode_id).first()
    if not episode:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Episode {req.episode_id} not found",
        )

    transcript = db.query(Transcript).filter(Transcript.episode_id == req.episode_id).first()
    raw_text = transcript.raw_text if transcript and transcript.raw_text else (episode.title or "")
    segments = transcript.segments if transcript and transcript.segments else []

    return chat_with_podcast_groq(
        user_message=req.message,
        podcast_title=episode.title,
        transcript_text=raw_text,
        segments=segments,
        chat_history=req.chat_history,
        language=req.language or "en",
    )
