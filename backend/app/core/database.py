from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings


class Base(DeclarativeBase):
    pass


_is_sqlite = settings.database_url.startswith("sqlite")

_engine_kwargs: dict = {
    "echo": settings.env == "development",
}

if _is_sqlite:
    # aiosqlite does not support connection pooling or Postgres-specific connect_args
    _engine_kwargs["poolclass"] = NullPool
    _engine_kwargs["connect_args"] = {}
else:
    # Postgres (asyncpg) — add any Postgres-specific connect_args here
    _engine_kwargs["connect_args"] = {
        "statement_cache_size": 0,
    }

engine = create_async_engine(settings.database_url, **_engine_kwargs)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def create_tables():
    """Create all tables on startup (dev convenience for SQLite)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncSession:
    """FastAPI dependency - yields a DB session per request."""
    async with AsyncSessionLocal() as session:
        yield session
