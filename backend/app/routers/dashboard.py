from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.dashboard import StatsResponse, WeeklyEpisodeItem
from app.services.dashboard_service import get_dashboard_stats, get_weekly_episodes

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=StatsResponse)
def read_stats(db: Session = Depends(get_db)):
    """
    Returns high-level platform analytics:
    - total_episodes
    - clips_generated
    - pending_reviews
    - avg_processing_time
    """
    return get_dashboard_stats(db)


@router.get("/weekly", response_model=List[WeeklyEpisodeItem])
def read_weekly(db: Session = Depends(get_db)):
    """
    Returns breakdown of episodes processed per week for trend visualization.
    """
    return get_weekly_episodes(db)
