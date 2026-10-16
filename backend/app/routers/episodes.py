from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.episode import EpisodeResponse
from app.schemas.transcript import TranscriptResponse
from app.services.episode_service import (
    create_episode_from_upload,
    get_episodes,
    get_episode_by_id,
    get_or_create_transcript_for_episode,
)

router = APIRouter(prefix="/episodes", tags=["Episodes"])


@router.post("", response_model=EpisodeResponse, status_code=status.HTTP_201_CREATED)
async def upload_episode(
    file: UploadFile = File(..., description="Podcast audio or video recording file"),
    title: Optional[str] = Form(None, description="Optional custom title for the episode"),
    db: Session = Depends(get_db),
):
    """
    Upload an audio/video file, save to storage directory, and create a new episode
    with initial status 'uploaded' and progress 0.
    """
    episode = create_episode_from_upload(db=db, file=file, title=title)
    return EpisodeResponse.model_validate(episode)


@router.get("", response_model=List[EpisodeResponse])
def list_episodes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Retrieve all podcast episodes sorted by recency.
    """
    episodes = get_episodes(db, skip=skip, limit=limit)
    return [EpisodeResponse.model_validate(ep) for ep in episodes]


@router.get("/{id}", response_model=EpisodeResponse)
def get_episode(
    id: int,
    db: Session = Depends(get_db),
):
    """
    Get detailed episode metadata by episode ID.
    """
    episode = get_episode_by_id(db, id)
    if not episode:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Episode {id} not found",
        )
    return EpisodeResponse.model_validate(episode)


@router.get("/{id}/transcript", response_model=TranscriptResponse)
def get_episode_transcript(
    id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieve timestamped transcript with speaker diarization for the episode.
    Returns realistic dummy segments with timestamps if raw ASR has not run yet.
    """
    return get_or_create_transcript_for_episode(db, id)
