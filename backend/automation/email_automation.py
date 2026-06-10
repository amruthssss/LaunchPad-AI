from config import settings


async def send_email_update(recipient: str, subject: str, body: str) -> dict:
    _ = body
    return {"recipient": recipient, "subject": subject, "smtp_host": settings.smtp_host, "status": "queued"}
