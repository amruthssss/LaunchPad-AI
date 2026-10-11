import httpx

from config import settings


async def send_slack_message(channel: str, text: str) -> dict:
    if not settings.slack_webhook_url:
        return {"status": "not_configured", "message": "Add SLACK_WEBHOOK_URL to enable Slack messages."}
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(settings.slack_webhook_url, json={"channel": channel, "text": text})
    return {"status": "completed" if response.is_success else "error", "message": response.text[:300] or "Message sent."}
