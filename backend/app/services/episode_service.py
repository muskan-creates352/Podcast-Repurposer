import os
import shutil
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.episode import Episode
from app.models.transcript import Transcript
from app.models.audit import AuditLog
from app.schemas.transcript import TranscriptResponse, TranscriptSegment


DUMMY_PODCAST_TRANSCRIPTS = {
    "default": [
        {
            "start": 0.0,
            "end": 8.5,
            "speaker": "Speaker 1 (Host)",
            "text": "Welcome back to The Creator Pipeline! Today we're discussing how AI is revolutionizing long-form podcast repurposing."
        },
        {
            "start": 8.5,
            "end": 22.0,
            "speaker": "Speaker 2 (Guest)",
            "text": "Thanks for having me! The biggest challenge creators face isn't recording content—it's that 90% of their recorded audio gets archived and forgotten after episode release."
        },
        {
            "start": 22.0,
            "end": 45.2,
            "speaker": "Speaker 1 (Host)",
            "text": "Exactly. An editor usually takes 4 to 6 hours scrubbing through an hour-long recording just to find 2 viral clips and write social threads."
        },
        {
            "start": 45.2,
            "end": 74.0,
            "speaker": "Speaker 2 (Guest)",
            "text": "With multimodal LLMs and grounding pipelines, we can extract timestamped highlights, generate SEO blog posts, and write tweet threads simultaneously in under 60 seconds."
        },
        {
            "start": 74.0,
            "end": 105.8,
            "speaker": "Speaker 1 (Host)",
            "text": "The critical differentiator is source citation. If an AI claims a quote was said, it must provide the exact timestamp so human editors can verify before publishing."
        },
        {
            "start": 105.8,
            "end": 130.5,
            "speaker": "Speaker 2 (Guest)",
            "text": "Human-in-the-loop review combined with strict grounding prevents hallucinations and gives creators 10x distribution leverage."
        }
    ]
}


def ensure_upload_dir() -> str:
    """Ensures uploads directory exists and returns its absolute path."""
    upload_path = os.path.abspath(settings.UPLOAD_DIR)
    os.makedirs(upload_path, exist_ok=True)
    return upload_path


def create_episode_from_upload(
    db: Session,
    file: UploadFile,
    title: Optional[str] = None,
    user_id: Optional[int] = None,
) -> Episode:
    """
    Saves an uploaded audio/video file to the /uploads directory and
    creates an Episode record with status 'uploaded' and progress 0.
    """
    upload_dir = ensure_upload_dir()

    # Determine episode title
    clean_filename = file.filename or "uploaded_podcast.mp3"
    episode_title = title.strip() if title and title.strip() else os.path.splitext(clean_filename)[0]

    # Unique storage filename
    timestamp_prefix = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    safe_stored_filename = f"{timestamp_prefix}_{clean_filename}"
    file_path = os.path.join(upload_dir, safe_stored_filename)

    file_size = 0
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        file_size = os.path.getsize(file_path)

    # Contract requires: { id, title, status, duration, created_at, progress }
    # Default status: uploaded, progress: 0
    episode = Episode(
        title=episode_title,
        status="uploaded",
        duration=0.0,
        progress=0,
        file_path=file_path,
        file_name=clean_filename,
        file_size=file_size,
        user_id=user_id,
    )
    db.add(episode)
    db.commit()
    db.refresh(episode)

    # Record in AuditLog
    audit = AuditLog(
        user_id=user_id,
        action="EPISODE_UPLOADED",
        resource_type="episode",
        resource_id=episode.id,
        details={"filename": clean_filename, "file_size": file_size},
    )
    db.add(audit)
    db.commit()

    return episode


def get_episodes(db: Session, skip: int = 0, limit: int = 100) -> List[Episode]:
    """Retrieves list of episodes sorted by creation date descending."""
    return db.query(Episode).order_by(Episode.created_at.desc()).offset(skip).limit(limit).all()


def get_episode_by_id(db: Session, episode_id: int) -> Optional[Episode]:
    """Retrieves a single episode by its ID."""
    return db.query(Episode).filter(Episode.id == episode_id).first()


def get_or_create_transcript_for_episode(db: Session, episode_id: int) -> TranscriptResponse:
    """
    Returns realistic dummy transcript with timestamps and speaker labels.
    If a transcript exists in the database, returns it.
    Otherwise, generates and persists a realistic dummy transcript for the episode.
    """
    episode = get_episode_by_id(db, episode_id)
    if not episode:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Episode with id {episode_id} not found",
        )

    # Check if DB already has a transcript
    db_transcript = db.query(Transcript).filter(Transcript.episode_id == episode_id).first()
    if db_transcript:
        segments = [
            TranscriptSegment(**seg) if isinstance(seg, dict) else seg
            for seg in db_transcript.segments
        ]
        return TranscriptResponse(
            episode_id=db_transcript.episode_id,
            language=db_transcript.language,
            raw_text=db_transcript.raw_text,
            segments=segments,
        )

    # Realistic dummy segments
    dummy_segments = DUMMY_PODCAST_TRANSCRIPTS["default"]
    raw_text = " ".join([f"[{s['speaker']}]: {s['text']}" for s in dummy_segments])

    # Save to DB so subsequent requests remain consistent
    new_transcript = Transcript(
        episode_id=episode_id,
        language="en",
        raw_text=raw_text,
        segments=dummy_segments,
    )
    db.add(new_transcript)
    db.commit()
    db.refresh(new_transcript)

    return TranscriptResponse(
        episode_id=new_transcript.episode_id,
        language=new_transcript.language,
        raw_text=new_transcript.raw_text,
        segments=[TranscriptSegment(**s) for s in dummy_segments],
    )
