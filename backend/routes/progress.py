"""
AcadMaid Progress Tracking Routes
POST /progress/mark    - Mark a video/topic as completed
GET  /progress         - Get all progress items
GET  /progress/summary - Get completion percentage
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from database import get_db
import models
from auth.auth_utils import get_current_user

router = APIRouter()


class MarkProgressRequest(BaseModel):
    item_id: str            # YouTube video ID or topic string
    item_type: str          # "video" or "topic"
    item_title: str = ""
    completed: bool = True  # True = mark complete, False = unmark


@router.post("/mark")
def mark_progress(
    request: MarkProgressRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark or unmark a video/topic as completed"""
    # Check if this item already has a progress entry
    existing = db.query(models.Progress).filter(
        models.Progress.user_id == current_user.id,
        models.Progress.item_id == request.item_id
    ).first()

    if existing:
        existing.completed = request.completed
        existing.completed_at = datetime.utcnow() if request.completed else None
    else:
        new_progress = models.Progress(
            user_id=current_user.id,
            item_id=request.item_id,
            item_type=request.item_type,
            item_title=request.item_title,
            completed=request.completed,
            completed_at=datetime.utcnow() if request.completed else None
        )
        db.add(new_progress)

    db.commit()
    return {"message": "Progress updated", "completed": request.completed}


@router.get("/")
def get_progress(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all progress items for the current user"""
    items = db.query(models.Progress).filter(
        models.Progress.user_id == current_user.id
    ).all()

    return {
        "progress": [
            {
                "item_id": p.item_id,
                "item_type": p.item_type,
                "item_title": p.item_title,
                "completed": p.completed,
                "completed_at": p.completed_at.isoformat() if p.completed_at else None
            }
            for p in items
        ]
    }


@router.get("/summary")
def get_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a summary: total completed videos and topics"""
    all_items = db.query(models.Progress).filter(
        models.Progress.user_id == current_user.id
    ).all()

    completed = [i for i in all_items if i.completed]
    videos_done = len([i for i in completed if i.item_type == "video"])
    topics_done = len([i for i in completed if i.item_type == "topic"])

    prefs = current_user.preferences
    total_videos = 4  # approximate from recommendations
    total_topics = (prefs.num_days * 2) if prefs and prefs.num_days else 10

    video_pct = min(100, round((videos_done / total_videos) * 100)) if total_videos else 0
    topic_pct = min(100, round((topics_done / total_topics) * 100)) if total_topics else 0
    overall_pct = round((video_pct + topic_pct) / 2)

    return {
        "videos_completed": videos_done,
        "topics_completed": topics_done,
        "video_percentage": video_pct,
        "topic_percentage": topic_pct,
        "overall_percentage": overall_pct
    }