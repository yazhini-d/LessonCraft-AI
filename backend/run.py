"""Application entry point for LessonCraft AI full-stack server."""
import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"
    print("\n" + "=" * 64)
    print(" 🚀 LessonCraft AI — Program Design & Dual QC Workflow")
    print(f" 🌐 Web Application & API:  http://localhost:{port}")
    print(f" 🩺 Health Check Endpoint:  http://localhost:{port}/health")
    print(f" 📚 Sample Benchmarks:      http://localhost:{port}/api/lessons/sample-inputs")
    print("=" * 64 + "\n")
    app.run(host="0.0.0.0", port=port, debug=debug)
