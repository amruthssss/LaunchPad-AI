import asyncio
import smtplib
from email.message import EmailMessage

from config import settings


async def send_email_update(recipient: str, subject: str, body: str) -> dict:
    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        return {"status": "not_configured", "message": "Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD to enable email."}
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_user
    message["To"] = recipient
    message.set_content(body)

    def deliver():
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(message)
    try:
        await asyncio.to_thread(deliver)
        return {"status": "completed", "recipient": recipient}
    except (OSError, smtplib.SMTPException) as exc:
        return {"status": "error", "message": str(exc)}
