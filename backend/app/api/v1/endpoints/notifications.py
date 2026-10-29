from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, parse_uuid
from app.models.notification import Notification, NotificationType
from app.models.related_case import RelatedCase
from app.models.user import User

router = APIRouter()


def serialize_notification(notification: Notification, db: Optional[Session] = None) -> dict:
    overlap_id = None
    if db and notification.complaint_id:
        rc = (
            db.query(RelatedCase)
            .filter(
                (RelatedCase.complaint_id_1 == notification.complaint_id)
                | (RelatedCase.complaint_id_2 == notification.complaint_id)
            )
            .order_by(RelatedCase.created_at.desc())
            .first()
        )
        if rc:
            overlap_id = str(rc.id)

    # Determine smart redirect target_path for 1-click issue/overlap navigation
    type_str = (notification.notification_type.value if notification.notification_type else "").lower()
    title_str = (notification.title or "").lower()
    msg_str = (notification.message or "").lower()
    complaint_num = notification.complaint.complaint_number if notification.complaint else None

    is_overlap = (
        "overlap" in type_str
        or "overlap" in title_str
        or "overlap" in msg_str
        or "duplicate" in title_str
        or "duplicate" in msg_str
    )
    is_coord = (
        "coordination" in type_str
        or "coordination" in title_str
        or "coordination" in msg_str
        or "transfer" in type_str
    )

    if is_overlap:
        if overlap_id:
            target_path = f"/overlaps?id={overlap_id}"
        elif complaint_num:
            target_path = f"/overlaps?search={complaint_num}"
        else:
            target_path = "/overlaps"
    elif is_coord:
        if overlap_id:
            target_path = f"/overlaps?id={overlap_id}"
        elif complaint_num:
            target_path = f"/coordination?search={complaint_num}"
        else:
            target_path = "/coordination"
    elif notification.complaint_id:
        target_path = f"/complaints?id={notification.complaint_id}"
    else:
        target_path = "/dashboard"

    return {
        "id": str(notification.id),
        "type": (
            notification.notification_type.value
            if notification.notification_type
            else None
        ),
        "title": notification.title,
        "message": notification.message,
        "severity": notification.severity.value if notification.severity else None,
        "complaint_id": str(notification.complaint_id) if notification.complaint_id else None,
        "complaint_number": complaint_num,
        "overlap_id": overlap_id,
        "target_path": target_path,
        "read": notification.read_at is not None,
        "created_at": str(notification.created_at) if notification.created_at else None,
        "read_at": str(notification.read_at) if notification.read_at else None,
    }


@router.get("")
def list_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Notification).filter(
        Notification.recipient_user_id == current_user.id
    )
    if unread_only:
        query = query.filter(Notification.read_at.is_(None))
    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
    return [serialize_notification(n, db) for n in notifications]


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = (
        db.query(Notification)
        .filter(
            Notification.recipient_user_id == current_user.id,
            Notification.read_at.is_(None),
        )
        .count()
    )
    return {"unread": count}


@router.post("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = (
        db.query(Notification)
        .filter(
            Notification.recipient_user_id == current_user.id,
            Notification.read_at.is_(None),
        )
        .update({Notification.read_at: datetime.utcnow()}, synchronize_session=False)
    )
    db.commit()
    return {"message": f"{updated} notification(s) marked as read"}


@router.post("/{id}/read")
def mark_read(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == parse_uuid(id),
            Notification.recipient_user_id == current_user.id,
        )
        .first()
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if not notification.read_at:
        notification.read_at = datetime.utcnow()
        db.commit()
        db.refresh(notification)
    return {"message": "Notification marked as read", "notification": serialize_notification(notification, db)}
