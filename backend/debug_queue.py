"""Debug PostgreSQL query in-process."""
import asyncio
import traceback
from app.core.database import AsyncSessionLocal
from app.api.routes.dashboard import get_priority_queue

async def debug():
    async with AsyncSessionLocal() as db:
        try:
            queue = await get_priority_queue(db)
            print("Queue count:", len(queue))
        except Exception as e:
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug())
