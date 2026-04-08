"""
AcadMaid Preferences Routes
POST /preferences  - Save user's learning preferences (onboarding)
GET  /preferences  - Get current user's preferences
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models
from auth.auth_utils import get_current_user

router = APIRouter()


class PreferencesRequest(BaseModel):
    subject: str            # e.g., "Python", "Web Dev", "AI/ML"
    skill_level: str        # "Beginner", "Intermediate", "Advanced"
    confidence: int         # 1-5
    hours_per_day: Optional[float] = None
    num_days: Optional[int] = None


@router.post("/")
def save_preferences(
    request: PreferencesRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save or update user learning preferences"""
    # Check if preferences already exist (update) or create new
    prefs = db.query(models.UserPreference).filter(
        models.UserPreference.user_id == current_user.id
    ).first()

    if prefs:
        # Update existing preferences
        prefs.subject = request.subject
        prefs.skill_level = request.skill_level
        prefs.confidence = request.confidence
        if request.hours_per_day:
            prefs.hours_per_day = request.hours_per_day
        if request.num_days:
            prefs.num_days = request.num_days
    else:
        # Create new preferences entry
        prefs = models.UserPreference(
            user_id=current_user.id,
            subject=request.subject,
            skill_level=request.skill_level,
            confidence=request.confidence,
            hours_per_day=request.hours_per_day,
            num_days=request.num_days
        )
        db.add(prefs)

    db.commit()
    db.refresh(prefs)
    return {"message": "Preferences saved successfully", "preferences": {
        "subject": prefs.subject,
        "skill_level": prefs.skill_level,
        "confidence": prefs.confidence,
        "hours_per_day": prefs.hours_per_day,
        "num_days": prefs.num_days
    }}


@router.get("/")
def get_preferences(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch the logged-in user's preferences"""
    prefs = db.query(models.UserPreference).filter(
        models.UserPreference.user_id == current_user.id
    ).first()

    if not prefs:
        raise HTTPException(status_code=404, detail="No preferences found. Please complete onboarding.")

    return {
        "subject": prefs.subject,
        "skill_level": prefs.skill_level,
        "confidence": prefs.confidence,
        "hours_per_day": prefs.hours_per_day,
        "num_days": prefs.num_days
    }