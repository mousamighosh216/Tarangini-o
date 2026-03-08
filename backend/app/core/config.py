# Centralized config loader
# Load environment variables (.env)
# DB URL
# JWT secret
# OAuth credentials
# Model path
# Environment (dev/prod)
# Return config object accessible everywhere.

import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env file
env_path = Path(__file__).parent.parent / ".env"  # adjust if .env is elsewhere
load_dotenv(dotenv_path=env_path)

class Settings:
    # Project
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Tarangini")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./tarangini.db")

    # JWT / Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecret")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

    # Environment
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True") == "True"

    # Optional admin default (Phase 1)
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@example.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")

    # Feature flags (Phase 2)
    ENABLE_VOTING: bool = os.getenv("ENABLE_VOTING", "True") == "True"
    ENABLE_COMMENT_EDIT: bool = os.getenv("ENABLE_COMMENT_EDIT", "True") == "True"

# Singleton instance
settings = Settings()