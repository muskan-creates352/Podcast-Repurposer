from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.episode import Episode
from app.models.clip import Clip
from app.models.content import GeneratedContent
from app.schemas.episode import EpisodeResponse
from app.schemas.clip import ClipResponse
from app.schemas.content import GeneratedContentResponse
from app.schemas.transcript import TranscriptResponse
from app.services.episode_service import (
    create_episode_from_upload,
    get_episodes,
    get_episode_by_id,
    get_or_create_transcript_for_episode,
)
from app.ai.workflow import run_langgraph_pipeline

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
    """
    return get_or_create_transcript_for_episode(db, id)


@router.get("/{id}/clips", response_model=List[ClipResponse])
def get_episode_clips(
    id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieve all extracted clips for an episode.
    Contract: { id, episode_id, start_time, end_time, text, reason, status }
    """
    episode = get_episode_by_id(db, id)
    if not episode:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Episode {id} not found",
        )
    clips = db.query(Clip).filter(Clip.episode_id == id).all()
    return [ClipResponse.model_validate(c) for c in clips]


@router.get("/{id}/content", response_model=List[GeneratedContentResponse])
def get_episode_content(
    id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieve all generated content assets (blog, social, show_notes) for an episode.
    Contract: { id, episode_id, type, body, source_timestamps, status }
    """
    episode = get_episode_by_id(db, id)
    if not episode:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Episode {id} not found",
        )
    content_items = db.query(GeneratedContent).filter(GeneratedContent.episode_id == id).all()
    return [GeneratedContentResponse.model_validate(item) for item in content_items]


@router.post("/{id}/process", status_code=status.HTTP_202_ACCEPTED)
def trigger_episode_processing(
    id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Triggers the LangGraph pipeline in a background task:
    uploaded -> transcribing -> processing -> ready_for_review.
    """
    episode = get_episode_by_id(db, id)
    if not episode:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Episode {id} not found",
        )

    # Immediately set to transcribing / queued
    episode.status = "transcribing"
    episode.progress = 10
    db.commit()

    # Schedule background LangGraph execution
    background_tasks.add_task(run_langgraph_pipeline, episode_id=id)

    return {
        "message": f"Pipeline triggered for episode {id}",
        "episode_id": id,
        "status": "transcribing",
        "progress": 10,
    }
