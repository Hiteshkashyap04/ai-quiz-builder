from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone

def get_utc_now():
    return datetime.now(timezone.utc)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    hashed_password: str
    full_name: Optional[str] = Field(default=None)
    avatar: Optional[str] = Field(default=None)

class Quiz(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int
    title: str
    description: Optional[str] = None
    content: str 
    created_at: datetime = Field(default_factory=get_utc_now)

# --- NEW TABLE FOR SCORES ---
class QuizResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    quiz_id: int
    user_id: int
    score: float  # Percentage (e.g., 80.0)
    created_at: datetime = Field(default_factory=get_utc_now)