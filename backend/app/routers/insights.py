from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.podcast_insights import InsightsResponse
from app.services.insights_service import get_podcast_insights

router = APIRouter(prefix="/episodes", tags=["Podcast Insights"])


@router.get("/{id}/insights", response_model=InsightsResponse, status_code=status.HTTP_200_OK)
def get_episode_insights(
    id: str,
    language: Optional[str] = Query("en", description="Language: en | hi | hinglish"),
    db: Session = Depends(get_db),
):
    """
    Retrieve Core Podcast Intelligence for an episode in English, Hindi, or Hinglish:
    - Podcast at a Glance (Overview, purpose, subjects, speakers)
    - 3-Tier Summaries (30-second, 1-minute, detailed, 5 takeaways)
    - Main Topics with exact timestamps
    - Smart Chapters with start/end boundaries
    - Actionable Key Takeaways
    """
    try:
        clean_id = int(str(id).replace("ep_", "").strip())
    except Exception:
        clean_id = 1
    return get_podcast_insights(db, clean_id, language=language or "en")
