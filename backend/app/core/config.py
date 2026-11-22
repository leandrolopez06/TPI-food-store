from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/.env: se busca al lado de la carpeta app/, sin importar desde dónde se ejecute
ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    """Variables de entorno de la aplicación (se leen del archivo .env)."""

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=ENV_FILE, env_file_encoding="utf-8")

    @field_validator("SECRET_KEY")
    @classmethod
    def clave_suficientemente_larga(cls, valor: str) -> str:
        if len(valor) < 32:
            raise ValueError("SECRET_KEY debe tener al menos 32 caracteres")
        return valor


settings = Settings()  # type: ignore[call-arg]  # los valores salen del .env