from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.notifications import NotificationItem
from app.services.notification_service import get_notifications

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationItem])
def list_notifications(
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """
    Returns real-time notifications derived from episode status transitions
    and audit log events.
    """
    return get_notifications(db=db, limit=limit)
