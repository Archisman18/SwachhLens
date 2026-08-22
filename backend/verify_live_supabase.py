"""Verify health and API operations against Supabase Postgres."""
import asyncio
import httpx

async def verify():
    async with httpx.AsyncClient(timeout=15.0, base_url="http://127.0.0.1:8000") as client:
        health = await client.get("/health")
        print("Health Check:", health.status_code, health.json())
        
        queue = await client.get("/dashboard/queue")
        print("Queue Fetch status:", queue.status_code)
        print("Queue Text:", queue.text)
        if queue.status_code == 200:
            print(f"Queue count: {len(queue.json())}")
        
        analytics = await client.get("/dashboard/analytics")
        print("Analytics:", analytics.status_code, analytics.json())

if __name__ == "__main__":
    asyncio.run(verify())
