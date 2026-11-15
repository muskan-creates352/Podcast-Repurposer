from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.podcast_insights import InsightsResponse
from app.services.insights_service import get_podcast_insights

router = APIRouter(prefix="/episodes", tags=["Podcast Insights"])


@router.get("/{id}/insights", response_model=InsightsResponse, status_code=status.HTTP_200_OK)
def get_episode_insights(
    id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieve Core Podcast Intelligence for an episode:
    - Podcast at a Glance (Overview, purpose, subjects, speakers)
    - 3-Tier Summaries (30-second, 1-minute, detailed, 5 takeaways)
    - Main Topics with exact timestamps
    - Smart Chapters with start/end boundaries
    - Actionable Key Takeaways
    """
    return get_podcast_insights(db, id)
