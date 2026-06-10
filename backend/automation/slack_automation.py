from config import settings


async def send_slack_message(channel: str, text: str) -> dict:
    return {"channel": channel, "text": text, "has_webhook": bool(settings.slack_webhook_url)}
