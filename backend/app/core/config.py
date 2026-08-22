from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database connection string
    # Default: local SQLite for zero-setup dev. Override with a Postgres/Supabase URL:
    #   postgresql+asyncpg://user:password@localhost:5432/swachhlens
    database_url: str = "sqlite+aiosqlite:///./swachhlens.db"

    # Supabase storage (for uploaded waste photos)
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_storage_bucket: str = "waste-photos"

    # AI Vision API (Groq)
    groq_api_key: str = ""

    # CORS - add your deployed frontend URLs here too
    allowed_origins: list[str] = [
        "http://localhost:5173",  # citizen-app dev
        "http://localhost:5174",  # admin-dashboard dev
    ]

    env: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
