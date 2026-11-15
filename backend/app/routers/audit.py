from typing import List, Optional, Any
from datetime import datetime
from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.audit import AuditLog

router = APIRouter(prefix="/audit", tags=["Audit"])


class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    resource_type: str
    resource_id: Optional[int] = None
    details: Optional[Any] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    episode_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Returns platform audit log records. Optionally filter by episode_id.
    """
    query = db.query(AuditLog)
    if episode_id is not None:
        query = query.filter(
            (AuditLog.resource_type == "episode") & (AuditLog.resource_id == episode_id)
        )
    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()
