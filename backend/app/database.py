from sqlmodel import create_engine, SQLModel, Session
import os

# CHANGE TO v4
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./quiz_v4.db")

engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else None)

def init_db():
    from .models import User, Quiz, QuizResult # <--- We will add QuizResult next
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session