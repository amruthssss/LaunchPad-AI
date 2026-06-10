from config import settings


async def create_notion_page(title: str) -> dict:
    return {"title": title, "notion_connected": bool(settings.notion_token)}
