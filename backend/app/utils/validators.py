"""Validation utilities for request inputs and error handling."""
from typing import Tuple, Optional, Dict, Any

def validate_lesson_input(data: Optional[Dict[str, Any]]) -> Tuple[bool, Optional[str], Dict[str, Any]]:
    """Validates lesson title and learning objective inputs.
    
    Returns:
        (is_valid, error_message, cleaned_data)
    """
    if not data or not isinstance(data, dict):
        return False, "Request body must be a valid JSON object.", {}
        
    title = data.get("title", "").strip()
    objective = data.get("learning_objective", "").strip()
    duration = data.get("target_duration", 45)

    if not title:
        return False, "Lesson Title is required and cannot be empty.", {}
        
    if len(title) < 3:
        return False, "Lesson Title must be at least 3 characters long.", {}
        
    if len(title) > 200:
        return False, "Lesson Title must not exceed 200 characters.", {}

    if not objective:
        return False, "Learning Objective is required and cannot be empty.", {}
        
    if len(objective) < 10:
        return False, "Learning Objective must be at least 10 characters long to provide sufficient pedagogical context.", {}

    try:
        duration = int(duration)
        if duration <= 0 or duration > 180:
            duration = 45
    except (ValueError, TypeError):
        duration = 45

    return True, None, {
        "title": title,
        "learning_objective": objective,
        "target_duration": duration
    }

def format_error_response(message: str, code: str = "VALIDATION_ERROR", status_code: int = 400, details: Any = None):
    """Formats standardized error payload."""
    payload = {
        "success": False,
        "error": {
            "code": code,
            "message": message
        }
    }
    if details:
        payload["error"]["details"] = details
    return payload, status_code
