from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Registration ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    """Fields required to create a new account."""
    username: str
    email: EmailStr
    password: str


# ── Login ─────────────────────────────────────────────────────────────────────

class UserLogin(BaseModel):
    """Fields required to log in (accepts username OR email + password)."""
    username_or_email: str
    password: str


# ── Public user representation ────────────────────────────────────────────────

class UserOut(BaseModel):
    """Safe, public-facing representation of a user (no password)."""
    id: int
    username: str
    email: str
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── JWT token ─────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Decoded payload stored inside the JWT."""
    user_id: Optional[int] = None
    username: Optional[str] = None
