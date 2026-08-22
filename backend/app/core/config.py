from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database connection string
    database_url: str = "sqlite+aiosqlite:///./swachhlens.db"

    # Supabase storage (for uploaded waste photos)
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_storage_bucket: str = "waste-photos"

    # AI Vision API (Groq)
    groq_api_key: str = ""

    # CORS - allowed frontend origins
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://localhost:80",
        "http://localhost",
        "*",
    ]

    env: str = "development"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
