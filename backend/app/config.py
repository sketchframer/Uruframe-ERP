"""Application configuration via pydantic-settings."""

from pathlib import Path

from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_ROOT / ".env")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        extra="ignore",
    )

    jwt_secret: str = "change-me-in-production"
    database_path: str = "data/structura.db"
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.0.121:3000"]

    @field_validator("cors_origins", mode="after")
    @classmethod
    def strip_cors_origins(cls, v: list[str]) -> list[str]:
        return [origin.strip() for origin in v]

    @property
    def database_url(self) -> str:
        path = Path(self.database_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{path.resolve()}"


settings = Settings()
