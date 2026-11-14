from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.episode import Episode
from app.models.transcript import Transcript
from app.ai.audio_processor import format_timestamp

router = APIRouter(prefix="/search", tags=["Search"])


class SearchResultItem(BaseModel):
    episode_id: int
    episode_title: str
    timestamp: str
    start_time: float
    end_time: float
    speaker: str
    snippet: str


@router.get("", response_model=List[SearchResultItem])
def search_episodes(
    q: str = Query(..., min_length=1, description="Query term to search across past transcripts"),
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """
    RAG search across all past episode transcripts.
    Matches query keywords against transcript segments and returns top occurrences
    with timestamp citations and speaker attribution.
    """
    query_lower = q.lower().strip()
    results: List[SearchResultItem] = []

    transcripts = db.query(Transcript).all()
    for t in transcripts:
        episode = db.query(Episode).filter(Episode.id == t.episode_id).first()
        ep_title = episode.title if episode else f"Episode {t.episode_id}"

        for seg in (t.segments or []):
            text = seg.get("text", "")
            if query_lower in text.lower():
                start_sec = float(seg.get("start", 0.0))
                end_sec = float(seg.get("end", 0.0))
                results.append(
                    SearchResultItem(
                        episode_id=t.episode_id,
                        episode_title=ep_title,
                        timestamp=f"{format_timestamp(start_sec)} - {format_timestamp(end_sec)}",
                        start_time=start_sec,
                        end_time=end_sec,
                        speaker=seg.get("speaker", "Speaker"),
                        snippet=text,
                    )
                )
                if len(results) >= limit:
                    return results

    return results
