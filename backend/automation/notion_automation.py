import httpx

from config import settings


async def create_notion_page(title: str) -> dict:
    if not settings.notion_token or not settings.notion_parent_page_id:
        return {"status": "not_configured", "message": "Set NOTION_TOKEN and NOTION_PARENT_PAGE_ID to enable Notion export."}
    headers = {"Authorization": f"Bearer {settings.notion_token}", "Notion-Version": "2022-06-28", "Content-Type": "application/json"}
    payload = {"parent": {"type": "page_id", "page_id": settings.notion_parent_page_id}, "properties": {"title": {"title": [{"text": {"content": title[:1800]}}]}}}
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post("https://api.notion.com/v1/pages", headers=headers, json=payload)
    if response.is_error:
        return {"status": "error", "message": f"Notion returned {response.status_code}: {response.text[:300]}"}
    result = response.json()
    return {"status": "completed", "url": result.get("url")}
