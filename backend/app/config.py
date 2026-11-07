import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "lessoncraft-secret-key-2026")
    DATA_DIR = BASE_DIR / "data"
    DB_PATH = DATA_DIR / "lessons.json"
    
    # API Keys
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
    
    # Defaults
    TARGET_DURATION_MINUTES = 45
    CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]

    @classmethod
    def init_app(cls, app):
        os.makedirs(cls.DATA_DIR, exist_ok=True)
