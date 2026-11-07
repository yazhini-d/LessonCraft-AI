"""Extensions module for Flask application."""

def init_extensions(app):
    """Initialize app extensions, directories, and hooks."""
    from app.config import Config
    Config.init_app(app)

