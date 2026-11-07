"""Research Routes: Standalone research triggers and retry endpoints."""
import logging
from flask import Blueprint, request, jsonify
from app.services.research_service import ResearchService
from app.models.lesson import LessonStore
from app.utils.validators import validate_lesson_input, format_error_response

logger = logging.getLogger(__name__)
research_bp = Blueprint("research", __name__, url_prefix="/api/research")

@research_bp.route("", methods=["POST"])
def conduct_research():
    """Runs standalone research for a topic without generating full lesson."""
    data = request.get_json(silent=True)
    is_valid, error_msg, cleaned_data = validate_lesson_input(data)
    if not is_valid:
        return format_error_response(error_msg, code="INVALID_INPUT", status_code=400)

    try:
        title = cleaned_data["title"]
        objective = cleaned_data["learning_objective"]
        results = ResearchService.research_topic(title, objective)
        return jsonify({"success": True, "research": results})
    except Exception as e:
        logger.exception("Research failed")
        return format_error_response(f"Research failed: {str(e)}", code="RESEARCH_ERROR", status_code=500)

@research_bp.route("/retry", methods=["POST"])
def retry_research():
    """Retries research for an existing lesson."""
    data = request.get_json(silent=True) or {}
    lesson_id = data.get("lesson_id")
    if not lesson_id:
        return format_error_response("lesson_id is required", code="MISSING_ID", status_code=400)

    lesson = LessonStore.get_by_id(lesson_id)
    if not lesson:
        return format_error_response("Lesson not found", code="NOT_FOUND", status_code=404)

    try:
        title = lesson.get("title", "")
        objective = lesson.get("learning_objective", "")
        new_research = ResearchService.research_topic(title, objective)
        lesson["research"] = new_research
        # Update references and videos
        lesson["content"]["supplementary_videos"] = new_research.get("videos", [])
        updated = LessonStore.save_or_update(lesson)
        return jsonify({"success": True, "message": "Research refreshed successfully", "lesson": updated})
    except Exception as e:
        logger.exception("Failed to retry research")
        return format_error_response("Failed to refresh research", code="RETRY_ERROR", status_code=500)

