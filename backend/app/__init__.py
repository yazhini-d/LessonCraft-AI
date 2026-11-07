"""Flask Application Factory for LessonCraft AI."""
import os
from pathlib import Path
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from app.config import Config
from app.extensions import init_extensions
from app.routes import lesson_bp, research_bp, qc_bp

def create_app(config_class=Config):
    frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
    
    app = Flask(__name__, static_folder=str(frontend_dist) if frontend_dist.exists() else None)
    app.config.from_object(config_class)

    # Initialize extensions
    init_extensions(app)

    # Enable CORS for frontend integration
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register API blueprints
    app.register_blueprint(lesson_bp)
    app.register_blueprint(research_bp)
    app.register_blueprint(qc_bp)

    @app.route("/health", methods=["GET"])
    def health_check():
        from app.services.ai_service import AIService
        return jsonify({
            "status": "healthy",
            "service": "LessonCraft AI Backend",
            "version": "1.0.0",
            "ai_provider": AIService.get_active_provider(),
            "target_lesson_duration": 45,
            "frontend_served": frontend_dist.exists()
        })

    # Serve React Frontend SPA if built
    if frontend_dist.exists():
        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_frontend(path):
            if path and (frontend_dist / path).exists():
                return send_from_directory(frontend_dist, path)
            return send_from_directory(frontend_dist, "index.html")

    return app
