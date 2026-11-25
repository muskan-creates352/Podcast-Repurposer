from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.podcast_insights import InsightsResponse
from app.schemas.strategy import StrategyResponse
from app.schemas.intelligence import (
    ConversationalOverviewResponse,
    PodcastBriefResponse,
    AudienceModeResponse,
    VocabularyResponse,
    TimelineResponse,
)
from app.services.insights_service import get_podcast_insights, get_repurposing_strategy
from app.services.intelligence_service import (
    get_conversational_overview,
    get_podcast_brief,
    get_audience_mode_explanation,
    get_podcast_vocabulary,
    get_smart_timeline,
)

router = APIRouter(prefix="/episodes", tags=["Podcast Insights"])


def _clean_id(raw_id: str) -> int:
    try:
        return int(str(raw_id).replace("ep_", "").strip())
    except Exception:
        return 1


@router.get("/{id}/strategy", response_model=StrategyResponse, status_code=status.HTTP_200_OK)
def get_episode_strategy(
    id: str,
    db: Session = Depends(get_db),
):
    """
    Phase 5: AI Repurposing Strategy Agent.
    Returns tailored multi-format recommendations (format, target audience, hook, key message, potential).
    """
    return get_repurposing_strategy(db, _clean_id(id))


@router.get("/{id}/insights", response_model=InsightsResponse, status_code=status.HTTP_200_OK)
def get_episode_insights(
    id: str,
    language: Optional[str] = Query("en", description="Language: en | hi | hinglish"),
    db: Session = Depends(get_db),
):
    """
    Retrieve Core Podcast Intelligence for an episode in English, Hindi, or Hinglish.
    """
    return get_podcast_insights(db, _clean_id(id), language=language or "en")


@router.get("/{id}/conversational-overview", response_model=ConversationalOverviewResponse, status_code=status.HTTP_200_OK)
def get_episode_conversational_overview(
    id: str,
    db: Session = Depends(get_db),
):
    """
    Phase 6 (HIGH PRIORITY): Listen to Episode Overview.
    Natural, conversational narrative explaining what happened in the episode.
    """
    return get_conversational_overview(db, _clean_id(id))


@router.get("/{id}/brief", response_model=PodcastBriefResponse, status_code=status.HTTP_200_OK)
def get_episode_brief(
    id: str,
    db: Session = Depends(get_db),
):
    """
    Phase 8: Podcast Brief.
    Organized, actionable executive brief with key quotes, tools, and takeaways.
    """
    return get_podcast_brief(db, _clean_id(id))


@router.get("/{id}/audience-mode", response_model=AudienceModeResponse, status_code=status.HTTP_200_OK)
def get_episode_audience_mode(
    id: str,
    mode: Optional[str] = Query("beginner", description="beginner | student | developer | professional | quick_summary"),
    db: Session = Depends(get_db),
):
    """
    Phase 9: Audience Mode.
    Adapts explanation depth, language, and context to the listener's profile.
    """
    return get_audience_mode_explanation(db, _clean_id(id), mode or "beginner")


@router.get("/{id}/vocabulary", response_model=VocabularyResponse, status_code=status.HTTP_200_OK)
def get_episode_vocabulary(
    id: str,
    db: Session = Depends(get_db),
):
    """
    Phase 10: AI Vocabulary Extractor.
    Extracts technical, unfamiliar, or high-leverage terms used in the podcast.
    """
    return get_podcast_vocabulary(db, _clean_id(id))


@router.get("/{id}/timeline", response_model=TimelineResponse, status_code=status.HTTP_200_OK)
def get_episode_timeline(
    id: str,
    db: Session = Depends(get_db),
):
    """
    Phase 11: Smart Podcast Timeline.
    Visual segments with categories and exact timestamps.
    """
    return get_smart_timeline(db, _clean_id(id))

