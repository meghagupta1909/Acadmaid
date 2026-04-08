"""
AcadMaid Database Configuration
Uses SQLite for simplicity (can swap to PostgreSQL by changing DATABASE_URL)
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database file will be created in the backend folder
DATABASE_URL = "sqlite:///./acadmaid.db"

# For PostgreSQL, replace with:
# DATABASE_URL = "postgresql://user:password@localhost/acadmaid"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed only for SQLite
)

# Each request gets its own session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all database models
Base = declarative_base()


def get_db():
    """Dependency that provides a database session to route handlers"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()