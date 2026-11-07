"""Lesson Routes: Handles creation, editing, retrieval, QC patch application, and exports."""
import logging
from flask import Blueprint, request, jsonify, Response
from app.models.lesson import LessonStore
from app.services.lesson_service import LessonService
from app.services.factual_qc import FactualQCService
from app.services.instructional_qc import InstructionalQCService
from app.services.export_service import ExportService
from app.utils.validators import validate_lesson_input, format_error_response

logger = logging.getLogger(__name__)
lesson_bp = Blueprint("lessons", __name__, url_prefix="/api/lessons")

@lesson_bp.route("/sample-inputs", methods=["GET"])
def get_sample_inputs():
    """Returns official sample test benchmarks required by the specification."""
    samples = [
        {
            "id": "sample-http",
            "title": "HTTP Requests and Responses",
            "learning_objective": "Explain GET and POST methods and distinguish between 2xx, 4xx, and 5xx response status categories.",
            "target_duration": 45,
            "description": "Primary benchmark specified in the Kalvium AI Research Intern assignment."
        },
        {
            "id": "sample-binary-search",
            "title": "Binary Search Algorithm: Theory, Implementation, and Complexity",
            "learning_objective": "Implement binary search iteratively and recursively, analyze its O(log n) time complexity, and identify boundary condition pitfalls (off-by-one errors).",
            "target_duration": 45,
            "description": "Secondary algorithm benchmark testing mathematical proofs and implementation pitfalls."
        }
    ]
    return jsonify({"success": True, "samples": samples})

@lesson_bp.route("/generate", methods=["POST"])
def generate_lesson():
    """Generates a complete 45-minute lesson with automated research and dual QC layers."""
    data = request.get_json(silent=True)
    is_valid, error_msg, cleaned_data = validate_lesson_input(data)
    if not is_valid:
        return format_error_response(error_msg, code="INVALID_INPUT", status_code=400)

    try:
        title = cleaned_data["title"]
        objective = cleaned_data["learning_objective"]
        duration = cleaned_data["target_duration"]

        # Step 1 & 2: Research & Synthesize Lesson
        lesson_data = LessonService.generate_lesson(title, objective, duration)

        # Step 3: QC Layer 1 - Research & Factual Accuracy
        qc_layer_1 = FactualQCService.audit_lesson(lesson_data)
        lesson_data["qc_layer_1"] = qc_layer_1

        # Step 4: QC Layer 2 - Instructional Quality
        qc_layer_2 = InstructionalQCService.audit_lesson(lesson_data)
        lesson_data["qc_layer_2"] = qc_layer_2

        # Step 5: Persist to storage
        saved_lesson = LessonStore.save_or_update(lesson_data)

        return jsonify({
            "success": True,
            "message": "Lesson generated and audited through both QC layers successfully.",
            "lesson": saved_lesson
        }), 201

    except Exception as e:
        logger.exception("Lesson generation failed")
        return format_error_response(f"Lesson generation pipeline failed: {str(e)}", code="GENERATION_FAILED", status_code=500)

@lesson_bp.route("", methods=["GET"])
def list_lessons():
    """Returns all saved lessons."""
    try:
        lessons = LessonStore.load_all()
        return jsonify({"success": True, "count": len(lessons), "lessons": lessons})
    except Exception as e:
        logger.exception("Failed to load lessons")
        return format_error_response("Failed to retrieve lessons.", code="RETRIEVAL_ERROR", status_code=500)

@lesson_bp.route("/<lesson_id>", methods=["GET"])
def get_lesson(lesson_id):
    """Retrieves a single lesson by ID."""
    lesson = LessonStore.get_by_id(lesson_id)
    if not lesson:
        return format_error_response("Lesson not found", code="NOT_FOUND", status_code=404)
    return jsonify({"success": True, "lesson": lesson})

@lesson_bp.route("/<lesson_id>", methods=["PUT"])
def update_lesson(lesson_id):
    """Allows instructors to review, edit, and save modified lesson content."""
    existing = LessonStore.get_by_id(lesson_id)
    if not existing:
        return format_error_response("Lesson not found", code="NOT_FOUND", status_code=404)

    payload = request.get_json(silent=True)
    if not payload or not isinstance(payload, dict):
        return format_error_response("Invalid payload", code="INVALID_BODY", status_code=400)

    # Allow editing title, objective, content, notes
    if "title" in payload:
        existing["title"] = payload["title"]
    if "learning_objective" in payload:
        existing["learning_objective"] = payload["learning_objective"]
    if "content" in payload:
        existing["content"] = payload["content"]
    if "status" in payload:
        existing["status"] = payload["status"]

    updated = LessonStore.save_or_update(existing)
    return jsonify({"success": True, "message": "Lesson updated successfully", "lesson": updated})

@lesson_bp.route("/<lesson_id>", methods=["DELETE"])
def delete_lesson(lesson_id):
    """Deletes a lesson from storage."""
    deleted = LessonStore.delete(lesson_id)
    if not deleted:
        return format_error_response("Lesson not found", code="NOT_FOUND", status_code=404)
    return jsonify({"success": True, "message": "Lesson deleted successfully"})

@lesson_bp.route("/<lesson_id>/apply-qc", methods=["POST"])
def apply_qc_recommendation(lesson_id):
    """Applies a suggested QC improvement directly into the lesson content."""
    lesson = LessonStore.get_by_id(lesson_id)
    if not lesson:
        return format_error_response("Lesson not found", code="NOT_FOUND", status_code=404)

    body = request.get_json(silent=True) or {}
    fix_id = body.get("fix_id")
    layer = body.get("layer")  # "qc_layer_1" or "qc_layer_2"

    if not fix_id:
        return format_error_response("Missing fix_id parameter", code="MISSING_FIX_ID", status_code=400)

    applied = False
    target_fix = None

    # Check layer 1
    if layer == "qc_layer_1" or not layer:
        qc1 = lesson.get("qc_layer_1", {})
        for fix in qc1.get("suggested_improvements", []):
            if fix.get("id") == fix_id:
                target_fix = fix
                fix["applied"] = True
                applied = True
                break

    # Check layer 2
    if not applied and (layer == "qc_layer_2" or not layer):
        qc2 = lesson.get("qc_layer_2", {})
        for fix in qc2.get("suggested_improvements", []):
            if fix.get("id") == fix_id:
                target_fix = fix
                fix["applied"] = True
                applied = True
                break

    if not target_fix:
        return format_error_response("QC Recommendation ID not found", code="FIX_NOT_FOUND", status_code=404)

    # Merge patch_text into matching section
    target_section_title = target_fix.get("target_section", "")
    patch_text = target_fix.get("patch_text", "")
    sections = lesson.get("content", {}).get("sections", [])

    matched = False
    for sec in sections:
        if target_section_title.lower() in sec.get("title", "").lower() or sec.get("id") == target_section_title:
            sec["markdown_content"] = (sec.get("markdown_content", "") + "\n" + patch_text).strip()
            matched = True
            break

    # If no specific section matched, append to first section
    if not matched and sections:
        sections[0]["markdown_content"] = (sections[0].get("markdown_content", "") + "\n" + patch_text).strip()

    updated = LessonStore.save_or_update(lesson)
    return jsonify({
        "success": True,
        "message": f"Applied QC recommendation '{target_fix.get('id')}' to lesson.",
        "lesson": updated,
        "applied_fix": target_fix
    })

@lesson_bp.route("/<lesson_id>/export/<export_format>", methods=["GET"])
def export_lesson(lesson_id, export_format):
    """Exports lesson in markdown, printable HTML, or raw JSON format."""
    lesson = LessonStore.get_by_id(lesson_id)
    if not lesson:
        return format_error_response("Lesson not found", code="NOT_FOUND", status_code=404)

    export_format = export_format.lower()
    title_slug = lesson.get("title", "lesson").replace(" ", "_").lower()

    if export_format in ["md", "markdown"]:
        content = ExportService.to_markdown(lesson)
        return Response(
            content,
            mimetype="text/markdown",
            headers={"Content-Disposition": f"attachment;filename={title_slug}_lesson.md"}
        )
    elif export_format in ["html", "pdf"]:
        content = ExportService.to_html(lesson)
        return Response(
            content,
            mimetype="text/html",
            headers={"Content-Disposition": f"attachment;filename={title_slug}_lesson.html"}
        )
    elif export_format == "json":
        return jsonify({
            "success": True,
            "lesson": lesson
        })
    else:
        return format_error_response("Unsupported export format. Use 'markdown', 'html', or 'json'.", code="UNSUPPORTED_FORMAT", status_code=400)
