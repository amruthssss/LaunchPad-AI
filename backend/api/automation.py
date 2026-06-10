from fastapi import APIRouter

from automation.email_automation import send_email_update
from automation.github_automation import create_repository
from automation.notion_automation import create_notion_page
from automation.slack_automation import send_slack_message


router = APIRouter(tags=["automation"])


@router.post("/github")
async def github_automation(payload: dict) -> dict:
    return await create_repository(payload.get("name", "demo-repo"))


@router.post("/notion")
async def notion_automation(payload: dict) -> dict:
    return await create_notion_page(payload.get("title", "AI Startup Factory"))


@router.post("/email")
async def email_automation(payload: dict) -> dict:
    return await send_email_update(payload.get("recipient", "user@example.com"), payload.get("subject", "Update"), payload.get("body", "Hello"))


@router.post("/slack")
async def slack_automation(payload: dict) -> dict:
    return await send_slack_message(payload.get("channel", "#general"), payload.get("text", "Status update"))
