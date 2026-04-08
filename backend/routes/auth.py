"""
AcadMaid Auth Routes
POST /auth/signup  - Create a new user account
POST /auth/login   - Login and receive JWT token
GET  /auth/me      - Get current logged-in user info
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
import models
from auth.auth_utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


# ── Pydantic Schemas (request/response shapes) ──────────────────────────────

class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str
    has_preferences: bool  # tells frontend whether onboarding is done


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/signup", response_model=TokenResponse)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user and return a JWT token immediately"""
    # Check if email already exists
    existing = db.query(models.User).filter(models.User.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    # Create new user with hashed password
    new_user = models.User(
        email=request.email,
        hashed_password=hash_password(request.password),
        full_name=request.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Auto-login: generate token right after signup
    token = create_access_token({"sub": new_user.email})

    return TokenResponse(
        access_token=token,
        user_id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name or "",
        has_preferences=False  # new user hasn't done onboarding yet
    )


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Validate credentials and return a JWT token"""
    user = db.query(models.User).filter(models.User.email == request.email).first()

    # Don't reveal whether email or password is wrong (security best practice)
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": user.email})
    has_prefs = user.preferences is not None

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name or "",
        has_preferences=has_prefs
    )


@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    """Return the currently logged-in user's info"""
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "has_preferences": current_user.preferences is not None
    }