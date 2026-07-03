from __future__ import annotations

import math
import re
from dataclasses import dataclass


@dataclass(frozen=True)
class MarketProfile:
    base_tam_musd: int
    cagr_percent: int
    competitors: tuple[str, ...]
    pain_points: tuple[str, ...]


MARKET_MAP: dict[str, MarketProfile] = {
    "saas": MarketProfile(
        base_tam_musd=120,
        cagr_percent=23,
        competitors=("HubSpot", "Notion", "Airtable"),
        pain_points=("tool sprawl", "slow onboarding", "high churn"),
    ),
    "fintech": MarketProfile(
        base_tam_musd=180,
        cagr_percent=19,
        competitors=("Stripe", "Wise", "Adyen"),
        pain_points=("compliance overhead", "fraud risk", "cross-border fees"),
    ),
    "healthtech": MarketProfile(
        base_tam_musd=95,
        cagr_percent=17,
        competitors=("Teladoc", "Doctolib", "Omada Health"),
        pain_points=("care continuity", "data privacy", "provider burnout"),
    ),
    "edtech": MarketProfile(
        base_tam_musd=70,
        cagr_percent=16,
        competitors=("Coursera", "Duolingo", "Khan Academy"),
        pain_points=("low course completion", "engagement drop", "content freshness"),
    ),
    "default": MarketProfile(
        base_tam_musd=80,
        cagr_percent=14,
        competitors=("Incumbent A", "Incumbent B", "Incumbent C"),
        pain_points=("manual workflows", "legacy systems", "poor user experience"),
    ),
}

MODEL_MULTIPLIER: dict[str, float] = {
    "b2b": 1.15,
    "b2c": 1.05,
    "b2b2c": 1.1,
    "marketplace": 1.25,
    "subscription": 1.2,
    "freemium": 1.1,
    "api": 1.3,
}


def normalize_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def get_market_profile(industry: str) -> MarketProfile:
    key = normalize_key(industry)
    return MARKET_MAP.get(key, MARKET_MAP["default"])


def estimate_tam_musd(industry: str, business_model: str, idea: str) -> int:
    profile = get_market_profile(industry)
    model_multiplier = MODEL_MULTIPLIER.get(normalize_key(business_model), 1.0)

    signal_bonus = 1.0
    idea_lower = idea.lower()
    if "ai" in idea_lower:
        signal_bonus += 0.08
    if "automation" in idea_lower:
        signal_bonus += 0.06
    if "enterprise" in idea_lower:
        signal_bonus += 0.05

    return int(profile.base_tam_musd * model_multiplier * signal_bonus)


def format_money_musd(value_musd: int) -> str:
    if value_musd >= 1000:
        return f"${value_musd / 1000:.1f}B TAM"
    return f"${value_musd}M TAM"


def estimate_validation_score(completeness_ratio: float, confidence: float) -> float:
    raw = 5.5 + (completeness_ratio * 2.5) + (confidence * 2.0)
    return round(min(max(raw, 1.0), 9.8), 2)


def twelve_month_revenue_curve(base_mrr: int, growth_rate: float) -> list[dict[str, float]]:
    values: list[dict[str, float]] = []
    for month in range(1, 13):
        revenue = base_mrr * math.pow(1 + growth_rate, month - 1)
        churn = max(0.015, 0.05 - (month * 0.002))
        values.append(
            {
                "month": month,
                "predicted_revenue": round(float(revenue), 2),
                "churn": round(float(churn), 3),
            }
        )
    return values
