from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.clip import Clip
from app.models.content import GeneratedContent
from app.models.review import Review
from app.models.audit import AuditLog
from app.schemas.clip import ClipResponse
from app.schemas.content import GeneratedContentResponse

router = APIRouter(tags=["Reviews"])


class ClipReviewRequest(BaseModel):
    status: Literal["approved", "rejected", "pending"]
    text: Optional[str] = None
    notes: Optional[str] = None


class ContentReviewRequest(BaseModel):
    status: Literal["approved", "rejected", "pending"]
    body: Optional[str] = None
    notes: Optional[str] = None


@router.patch("/clips/{id}/review", response_model=ClipResponse)
def review_clip(
    id: int,
    review_in: ClipReviewRequest,
    db: Session = Depends(get_db),
):
    """
    Approve, reject, or edit a clip.
    Contract: Clip: { id, episode_id, start_time, end_time, text, reason, status }
    """
    clip = db.query(Clip).filter(Clip.id == id).first()
    if not clip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clip {id} not found",
        )

    clip.status = review_in.status
    if review_in.text is not None:
        clip.text = review_in.text

    # Record review and audit
    review = Review(
        target_type="clip",
        target_id=clip.id,
        action=review_in.status,
        notes=review_in.notes,
    )
    db.add(review)

    audit = AuditLog(
        action=f"CLIP_{review_in.status.upper()}",
        resource_type="clip",
        resource_id=clip.id,
        details={"status": review_in.status, "text_edited": review_in.text is not None},
    )
    db.add(audit)

    db.commit()
    db.refresh(clip)
    return ClipResponse.model_validate(clip)


@router.patch("/content/{id}/review", response_model=GeneratedContentResponse)
def review_content(
    id: int,
    review_in: ContentReviewRequest,
    db: Session = Depends(get_db),
):
    """
    Approve, reject, or edit generated content body.
    Contract: GeneratedContent: { id, episode_id, type, body, source_timestamps, status }
    """
    content = db.query(GeneratedContent).filter(GeneratedContent.id == id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"GeneratedContent {id} not found",
        )

    content.status = review_in.status
    if review_in.body is not None:
        content.body = review_in.body

    review = Review(
        target_type="content",
        target_id=content.id,
        action=review_in.status,
        notes=review_in.notes,
    )
    db.add(review)

    audit = AuditLog(
        action=f"CONTENT_{review_in.status.upper()}",
        resource_type="content",
        resource_id=content.id,
        details={"status": review_in.status, "body_edited": review_in.body is not None},
    )
    db.add(audit)

    db.commit()
    db.refresh(content)
    return GeneratedContentResponse.model_validate(content)
