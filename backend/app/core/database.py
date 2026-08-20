from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


engine = create_async_engine(settings.database_url, echo=(settings.env == "development"))
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def create_tables():
    """Create all tables on startup (dev convenience for SQLite)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncSession:
    """FastAPI dependency - yields a DB session per request."""
    async with AsyncSessionLocal() as session:
        yield session
