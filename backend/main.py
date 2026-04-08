"""
AcadMaid Backend - FastAPI Application
Main entry point for the API server
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, preferences, recommendations, plan, progress

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AcadMaid API",
    description="Backend API for AcadMaid Learning Platform",
    version="1.0.0"
)

# Allow React frontend to communicate with FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all route groups
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(preferences.router, prefix="/preferences", tags=["Preferences"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
app.include_router(plan.router, prefix="/plan", tags=["Learning Plan"])
app.include_router(progress.router, prefix="/progress", tags=["Progress"])


@app.get("/")
def root():
    return {"message": "Welcome to AcadMaid API", "status": "running"}