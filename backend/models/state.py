from __future__ import annotations

from typing import TypedDict


class AgentState(TypedDict, total=False):
    idea: str
    industry: str
    target_audience: str
    country: str
    business_model: str
    session_id: str
    market_research: dict
    business_plan: dict
    tech_architecture: dict
    generated_code: dict
    forecast: dict
    deployment_config: dict
    critic_scores: dict
    retry_flags: dict
    retry_counts: dict
    step_status: dict
