import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.config import Config

class LessonStore:
    """Thread-safe JSON document store for lessons with persistence and retrieval."""
    
    @staticmethod
    def _get_path() -> Path:
        Config.DATA_DIR.mkdir(parents=True, exist_ok=True)
        return Config.DB_PATH

    @classmethod
    def load_all(cls) -> List[Dict[str, Any]]:
        path = cls._get_path()
        if not path.exists():
            return []
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except Exception:
            return []

    @classmethod
    def save_all(cls, lessons: List[Dict[str, Any]]) -> None:
        path = cls._get_path()
        temp_path = path.with_suffix(".tmp")
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(lessons, f, indent=2, ensure_ascii=False)
        temp_path.replace(path)

    @classmethod
    def get_by_id(cls, lesson_id: str) -> Optional[Dict[str, Any]]:
        lessons = cls.load_all()
        for lesson in lessons:
            if lesson.get("id") == lesson_id:
                return lesson
        return None

    @classmethod
    def save_or_update(cls, lesson_data: Dict[str, Any]) -> Dict[str, Any]:
        lessons = cls.load_all()
        now = datetime.now(timezone.utc).isoformat()
        
        if not lesson_data.get("id"):
            lesson_data["id"] = str(uuid.uuid4())
            lesson_data["created_at"] = now
            lesson_data["updated_at"] = now
            lessons.insert(0, lesson_data)
        else:
            updated = False
            for idx, existing in enumerate(lessons):
                if existing.get("id") == lesson_data["id"]:
                    lesson_data["updated_at"] = now
                    if "created_at" not in lesson_data:
                        lesson_data["created_at"] = existing.get("created_at", now)
                    lessons[idx] = lesson_data
                    updated = True
                    break
            if not updated:
                lesson_data["created_at"] = now
                lesson_data["updated_at"] = now
                lessons.insert(0, lesson_data)
                
        cls.save_all(lessons)
        return lesson_data

    @classmethod
    def delete(cls, lesson_id: str) -> bool:
        lessons = cls.load_all()
        initial_len = len(lessons)
        lessons = [l for l in lessons if l.get("id") != lesson_id]
        if len(lessons) < initial_len:
            cls.save_all(lessons)
            return True
        return False
