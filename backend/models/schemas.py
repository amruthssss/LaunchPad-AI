from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class StartupGenerateRequest(BaseModel):
    idea: str = Field(min_length=8, max_length=2000)
    industry: str = Field(min_length=1, max_length=120)
    target_audience: str = Field(default="", max_length=300)
    country: str = Field(default="", max_length=120)
    business_model: str = Field(min_length=1, max_length=120)


class StartupSessionResponse(BaseModel):
    session_id: str


class StartupStatusResponse(BaseModel):
    session_id: str
    idea: str = ""
    step_status: dict[str, Any]
    outputs: dict[str, Any]


class StartupHistoryItem(BaseModel):
    id: str
    idea: str
    status: str
    created_at: datetime
