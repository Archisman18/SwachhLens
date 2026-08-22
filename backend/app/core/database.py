import ssl
from uuid import uuid4

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings


class Base(DeclarativeBase):
    pass


ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE


engine = create_async_engine(
    settings.database_url,
    echo=(settings.env == "development"),
    poolclass=NullPool,
    connect_args={
        "ssl": ssl_context,
        "statement_cache_size": 0,
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid4()}__",
    },
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def create_tables():
    """Create all tables on startup (dev convenience for SQLite)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncSession:
    """FastAPI dependency - yields a DB session per request."""
    async with AsyncSessionLocal() as session:
        yield session
