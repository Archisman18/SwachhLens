from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Postgres connection string (Supabase project settings -> Database -> Connection string)
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/swachhlens"

    # Supabase storage (for uploaded waste photos)
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_storage_bucket: str = "waste-photos"

    # CORS - add your deployed frontend URLs here too
    allowed_origins: list[str] = [
        "http://localhost:5173",  # citizen-app dev
        "http://localhost:5174",  # admin-dashboard dev
    ]

    env: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
