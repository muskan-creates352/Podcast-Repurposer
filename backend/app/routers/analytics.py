from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics_service import get_analytics_metrics

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("", response_model=AnalyticsResponse)
def read_analytics(db: Session = Depends(get_db)):
    """
    Returns platform analytics:
    - approval_rate
    - avg_processing_time
    - content_types_generated
    - episodes_per_week
    """
    return get_analytics_metrics(db=db)
