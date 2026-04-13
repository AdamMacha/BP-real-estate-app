from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/realestate_db"
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # Scraping
    SREALITY_API_URL: str = "https://www.sreality.cz/api/cs/v2/estates"
    BEZREALITKY_BASE_URL: str = "https://www.bezrealitky.cz/vyhledat?location=exact&osm_value=%C4%8Cesko"
    
    # Rate limiting
    REQUEST_DELAY: float = 1.0  # seconds between requests
    MAX_RETRIES: int = 3
    
    # Scraping Limits
    MAX_PAGES_SREALITY_DEFAULT: int = 50
    MAX_PAGES_BEZREALITKY_DEFAULT: int = 30
    MAX_PAGES_SCHEDULED_SREALITY: int = 50
    MAX_PAGES_SCHEDULED_BEZREALITKY: int = 30
    
    # Scheduling
    SCRAPE_CRON_HOUR: int = 2  # 2 AM
    SCRAPE_CRON_MINUTE: int = 0
    
    # Email notifications
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
