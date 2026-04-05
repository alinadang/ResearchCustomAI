import os
import dotenv
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

# Load optional dotenv file next to this module (e.g. app/core/env)
_local_env = os.path.join(os.path.dirname(__file__), "env")
if os.path.exists(_local_env):
    dotenv.load_dotenv(_local_env)
else:
    dotenv.load_dotenv()

# Map legacy/API key name to the setting expected by the app
if "API_KEY" in os.environ and "OPENAI_KEY" not in os.environ and "openai_key" not in os.environ:
    os.environ["OPENAI_KEY"] = os.environ["API_KEY"]

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
    #postgres_url: str
    postgres_url: Optional[str] = None


@lru_cache
def get_settings():
    """
    Get settings instance with caching to avoid multiple loads.
    """
    return Settings()