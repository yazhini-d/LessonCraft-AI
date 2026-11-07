"""Routes package initializer."""
from app.routes.lesson_routes import lesson_bp
from app.routes.research_routes import research_bp
from app.routes.qc_routes import qc_bp

__all__ = ["lesson_bp", "research_bp", "qc_bp"]

