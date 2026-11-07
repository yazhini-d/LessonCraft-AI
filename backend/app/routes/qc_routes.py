"""QC Routes: Dedicated endpoints for running and retrying QC Layer 1 and QC Layer 2."""
import logging
from flask import Blueprint, request, jsonify
from app.models.lesson import LessonStore
from app.services.factual_qc import FactualQCService
from app.services.instructional_qc import InstructionalQCService
from app.utils.validators import format_error_response

logger = logging.getLogger(__name__)
qc_bp = Blueprint("qc", __name__, url_prefix="/api/qc")

@qc_bp.route("/layer1", methods=["POST"])
def run_qc_layer1():
    """Runs or re-runs QC Layer 1: Research and Factual Accuracy."""
    data = request.get_json(silent=True) or {}
    lesson_id = data.get("lesson_id")
    lesson = None

    if lesson_id:
        lesson = LessonStore.get_by_id(lesson_id)
        if not lesson:
            return format_error_response("Lesson not found", code="NOT_FOUND", status_code=404)
    else:
        lesson = data.get("lesson")
        if not lesson:
            return format_error_response("Either lesson_id or lesson object is required", code="INVALID_BODY", status_code=400)

    try:
        report = FactualQCService.audit_lesson(lesson)
        if lesson_id:
            lesson["qc_layer_1"] = report
            LessonStore.save_or_update(lesson)

        return jsonify({"success": True, "qc_layer_1": report})
    except Exception as e:
        logger.exception("QC Layer 1 failed")
        return format_error_response(f"QC Layer 1 audit failed: {str(e)}", code="QC1_ERROR", status_code=500)

@qc_bp.route("/layer2", methods=["POST"])
def run_qc_layer2():
    """Runs or re-runs QC Layer 2: Instructional Quality."""
    data = request.get_json(silent=True) or {}
    lesson_id = data.get("lesson_id")
    lesson = None

    if lesson_id:
        lesson = LessonStore.get_by_id(lesson_id)
        if not lesson:
            return format_error_response("Lesson not found", code="NOT_FOUND", status_code=404)
    else:
        lesson = data.get("lesson")
        if not lesson:
            return format_error_response("Either lesson_id or lesson object is required", code="INVALID_BODY", status_code=400)

    try:
        report = InstructionalQCService.audit_lesson(lesson)
        if lesson_id:
            lesson["qc_layer_2"] = report
            LessonStore.save_or_update(lesson)

        return jsonify({"success": True, "qc_layer_2": report})
    except Exception as e:
        logger.exception("QC Layer 2 failed")
        return format_error_response(f"QC Layer 2 audit failed: {str(e)}", code="QC2_ERROR", status_code=500)

@qc_bp.route("/both", methods=["POST"])
def rerun_both_qc():
    """Re-runs both QC layers simultaneously on an updated or existing lesson."""
    data = request.get_json(silent=True) or {}
    lesson_id = data.get("lesson_id")
    if not lesson_id:
        return format_error_response("lesson_id is required", code="MISSING_ID", status_code=400)

    lesson = LessonStore.get_by_id(lesson_id)
    if not lesson:
        return format_error_response("Lesson not found", code="NOT_FOUND", status_code=404)

    try:
        qc1 = FactualQCService.audit_lesson(lesson)
        qc2 = InstructionalQCService.audit_lesson(lesson)
        lesson["qc_layer_1"] = qc1
        lesson["qc_layer_2"] = qc2
        updated = LessonStore.save_or_update(lesson)
        return jsonify({
            "success": True,
            "message": "Both QC layers re-audited successfully",
            "lesson": updated
        })
    except Exception as e:
        logger.exception("Failed to re-run both QC layers")
        return format_error_response("Failed to re-audit lesson", code="QC_ALL_ERROR", status_code=500)

