"""AI Service: Coordinates LLM generation (Gemini, OpenAI, or intelligent educational fallback)."""
import os
import json
import logging
from typing import Dict, Any, Optional
from app.config import Config

logger = logging.getLogger(__name__)

class AIService:
    """Provides generative AI capabilities with multi-provider support and guaranteed offline fallback."""

    @classmethod
    def get_active_provider(cls) -> str:
        if Config.GEMINI_API_KEY:
            return "gemini"
        elif Config.OPENAI_API_KEY:
            return "openai"
        return "fallback_engine"

    @classmethod
    def generate_json_response(cls, system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
        """Attempts to invoke configured LLMs and parse a JSON response."""
        provider = cls.get_active_provider()
        
        # 1. Try Gemini if configured
        if provider == "gemini":
            try:
                import google.generativeai as genai
                genai.configure(api_key=Config.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash", generation_config={"response_mime_type": "application/json"})
                prompt = f"{system_prompt}\n\nTask:\n{user_prompt}\n\nRespond ONLY with valid JSON."
                response = model.generate_content(prompt)
                if response and response.text:
                    cleaned = response.text.strip()
                    if cleaned.startswith("```json"):
                        cleaned = cleaned[7:]
                    if cleaned.endswith("```"):
                        cleaned = cleaned[:-3]
                    return json.loads(cleaned.strip())
            except Exception as e:
                logger.error(f"Gemini API generation failed: {e}")

        # 2. Try OpenAI if configured
        if provider == "openai":
            try:
                from openai import OpenAI
                client = OpenAI(api_key=Config.OPENAI_API_KEY)
                completion = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": f"{system_prompt}\nAlways output valid JSON."},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                raw = completion.choices[0].message.content
                if raw:
                    return json.loads(raw.strip())
            except Exception as e:
                logger.error(f"OpenAI API generation failed: {e}")

        return None
