from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, desc
from .database import init_db, engine, get_session
from .models import User, Quiz, QuizResult
# FIX: Import ScoreCreate
from .schemas import UserCreate, Token, QuizCreate, QuizOut, UserOut, UserUpdate, ScoreCreate
from .auth import get_password_hash, authenticate_user, create_access_token, get_current_user
from dotenv import load_dotenv
import json
import os

load_dotenv()

app = FastAPI(title="AI Quiz Builder - Backend (Full)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# --- Auth Routes ---

@app.post("/api/auth/register", response_model=Token)
def register(user: UserCreate):
    with Session(engine) as session:
        existing = session.exec(select(User).where(User.email == user.email)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        db_user = User(email=user.email, hashed_password=get_password_hash(user.password))
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        token = create_access_token({"sub": db_user.email})
        return {"access_token": token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
def login(form: UserCreate):
    with Session(engine) as session:
        user = authenticate_user(session, form.email, form.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_access_token({"sub": user.email})
        return {"access_token": token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/api/users/me", response_model=UserOut)
def update_user(payload: UserUpdate, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        db_user = session.get(User, current_user.id)
        if not db_user:
             raise HTTPException(status_code=404, detail="User not found")
        if payload.full_name is not None:
            db_user.full_name = payload.full_name
        if payload.avatar is not None:
            db_user.avatar = payload.avatar
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

# --- Quiz Routes ---

@app.post("/api/generate-quiz")
def generate_quiz(payload: QuizCreate):
    from .ai_client import generate_quiz_from_prompt
    num_q = payload.max_questions if payload.max_questions else 5
    text = generate_quiz_from_prompt(payload.prompt or payload.title, max_questions=num_q)
    if isinstance(text, list):
        return {"ok": True, "data": text}
    try:
        parsed = json.loads(text)
        return {"ok": True, "data": parsed}
    except Exception:
        return {"ok": False, "raw": text}

@app.post("/api/quizzes")
def save_quiz(payload: QuizCreate, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        quiz_content = payload.content if payload.content else "[]"
        quiz = Quiz(
            owner_id=current_user.id,
            title=payload.title,
            description=payload.description,
            content=quiz_content
        )
        session.add(quiz)
        session.commit()
        session.refresh(quiz)
        return {"ok": True, "quiz_id": quiz.id}

# --- UPDATED: List Quizzes with Best Score ---
@app.get("/api/quizzes", response_model=list[QuizOut])
def list_quizzes(current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        # 1. Get all quizzes for this user
        rows = session.exec(select(Quiz).where(Quiz.owner_id == current_user.id)).all()
        out = []
        for q in rows:
            # 2. Find the BEST score for this quiz
            best_result = session.exec(
                select(QuizResult)
                .where(QuizResult.quiz_id == q.id)
                .where(QuizResult.user_id == current_user.id)
                .order_by(desc(QuizResult.score)) # Get highest first
            ).first()

            best_score_val = best_result.score if best_result else None

            out.append(QuizOut(
                id=q.id,
                title=q.title,
                description=q.description,
                content=q.content,
                created_at=q.created_at.isoformat(),
                best_score=best_score_val # <--- Send back best score
            ))
        return out

@app.get("/api/quizzes/{quiz_id}")
def get_quiz(quiz_id: int, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        q = session.get(Quiz, quiz_id)
        if not q or q.owner_id != current_user.id:
            raise HTTPException(status_code=404, detail="Not found")
        return {
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "content": q.content,
            "created_at": q.created_at.isoformat()
        }

@app.delete("/api/quizzes/{quiz_id}")
def delete_quiz(quiz_id: int, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        quiz = session.get(Quiz, quiz_id)
        if not quiz or quiz.owner_id != current_user.id:
            raise HTTPException(status_code=404, detail="Quiz not found")
        session.delete(quiz)
        session.commit()
        return {"ok": True}

# --- NEW: Save Score Endpoint ---
@app.post("/api/quizzes/{quiz_id}/score")
def save_score(quiz_id: int, payload: ScoreCreate, current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        # Verify quiz exists
        quiz = session.get(Quiz, quiz_id)
        if not quiz:
             raise HTTPException(status_code=404, detail="Quiz not found")
        
        # Save result
        result = QuizResult(
            quiz_id=quiz_id,
            user_id=current_user.id,
            score=payload.score
        )
        session.add(result)
        session.commit()
        return {"ok": True}