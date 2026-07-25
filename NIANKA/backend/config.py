import sys
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

# Ensure project root is in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

class Settings(BaseSettings):
    PROJECT_NAME: str = "NIANKA API Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database (Chargée dynamiquement depuis .env)
    DATABASE_URL: str = ""
    
    # JWT (Chargé dynamiquement depuis .env)
    JWT_SECRET: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    
    # Server
    PORT: int = 8081
    HOST: str = "0.0.0.0"
    
    # Email / SMTP (Chargé dynamiquement depuis .env)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
