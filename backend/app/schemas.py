from pydantic import BaseModel
from typing import Optional

# --- Auth & User Schemas ---
class UserCreate(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class UserOut(BaseModel):
    id: Optional[int] = None
    email: str
    full_name: Optional[str] = None
    avatar: Optional[str] = None

# --- Quiz Schemas ---
class QuizCreate(BaseModel):
    title: str
    description: Optional[str] = None
    prompt: Optional[str] = None
    content: Optional[str] = None
    max_questions: Optional[int] = 5

# New Schema for saving a score
class ScoreCreate(BaseModel):
    score: float

class QuizOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    content: str
    created_at: str
    # NEW FIELD
    best_score: Optional[float] = None