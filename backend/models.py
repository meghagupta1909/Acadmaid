"""
AcadMaid Database Models
Defines the structure of all database tables
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    """Stores user account information"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships to other tables
    preferences = relationship("UserPreference", back_populates="user", uselist=False)
    progress_items = relationship("Progress", back_populates="user")


class UserPreference(Base):
    """Stores what the user wants to learn and their skill level"""
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    subject = Column(String, nullable=False)        # e.g., "Python", "Web Dev"
    skill_level = Column(String, nullable=False)    # Beginner / Intermediate / Advanced
    confidence = Column(Integer, nullable=False)    # 1-5 slider value
    hours_per_day = Column(Float, nullable=True)    # for plan generation
    num_days = Column(Integer, nullable=True)       # for plan generation
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="preferences")


class Progress(Base):
    """Tracks which videos/topics a user has completed"""
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(String, nullable=False)        # video ID or topic ID
    item_type = Column(String, nullable=False)      # "video" or "topic"
    item_title = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="progress_items")