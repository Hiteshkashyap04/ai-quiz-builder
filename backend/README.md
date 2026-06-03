# Backend - AI Quiz Builder

Run locally (development):

```bash
python -m venv .venv
source .venv/Scripts/activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Environment variables:

- `SECRET_KEY` - JWT secret (set in production)
- `DATABASE_URL` - SQLAlchemy DB URL (defaults to `sqlite:///./quiz_v4.db`)
- `MISTRAL_API_KEY` - Optional AI provider key
- `MISTRAL_MODEL` - Optional model name
- `USE_OFFLINE_FALLBACK` - set to `true` to avoid calling external AI

Deployment:

This repo includes a `Procfile` that starts the app with Gunicorn + Uvicorn worker for Heroku-like platforms.
