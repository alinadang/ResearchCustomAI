import os
import dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    """
    Settings class for app configuration, managing env variables
    and making them accessible throughout the app.
    """
    model_config: SettingsConfigDict = {
        "env_file": (
            ".env.development",
            ".env.development.local"
        ),
        "env_file_encoding": "utf-8"
    }

    app_name: str = "Custom AI Research Assistant"
    environment: str = "development"
    debug: bool = True

    # Keys
    openai_key: str
    postgres_url: str


@lru_cache
def get_settings():
    """
    Get settings instance with caching to avoid multiple loads.
    """
    return Settings()