import httpx

from config import settings


async def create_repository(name: str) -> dict:
    if not settings.github_token:
        return {"status": "not_configured", "message": "Add GITHUB_TOKEN to enable repository creation."}
    headers = {"Authorization": f"Bearer {settings.github_token}", "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    async with httpx.AsyncClient(headers=headers, timeout=20) as client:
        response = await client.post("https://api.github.com/user/repos", json={"name": name[:90], "description": "Startup launch plan generated with LaunchPad AI", "private": True, "auto_init": True})
    if response.is_error:
        return {"status": "error", "message": f"GitHub returned {response.status_code}: {response.text[:300]}"}
    result = response.json()
    return {"status": "completed", "repository": result.get("full_name"), "url": result.get("html_url")}
