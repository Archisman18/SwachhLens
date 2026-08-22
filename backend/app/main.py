from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_tables
from app.api.routes import complaints, dashboard

app = FastAPI(title="SwachhLens API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints.router)
app.include_router(dashboard.router)


@app.on_event("startup")
async def on_startup():
    try:
        await create_tables()
    except Exception as e:
        print(f"[Startup Warning] Database initialization deferred: {e}")


@app.get("/health")
async def health():
    return {"status": "ok"}
