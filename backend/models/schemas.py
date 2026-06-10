from datetime import datetime
from typing import Any

from pydantic import BaseModel


class StartupGenerateRequest(BaseModel):
    idea: str
    industry: str
    target_audience: str
    country: str
    business_model: str


class StartupSessionResponse(BaseModel):
    session_id: str


class StartupStatusResponse(BaseModel):
    session_id: str
    step_status: dict[str, Any]
    outputs: dict[str, Any]


class StartupHistoryItem(BaseModel):
    id: str
    idea: str
    status: str
    created_at: datetime
