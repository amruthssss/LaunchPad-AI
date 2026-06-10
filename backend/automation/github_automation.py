import httpx

from config import settings


async def create_repository(name: str) -> dict:
    headers = {"Authorization": f"Bearer {settings.github_token}"}
    async with httpx.AsyncClient(headers=headers):
        return {"repository": name, "status": "placeholder", "github_api_available": bool(settings.github_token)}
