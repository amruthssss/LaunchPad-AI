from __future__ import annotations

from models.state import AgentState


class ForecastingEngine:
    def revenue_forecast(self, state: AgentState) -> list[dict[str, float | str]]:
        model = state.get("business_model", "").lower()
        base_mrr = 2400 if "enterprise" in model or "saas" in model else 1200
        growth = 0.12 if "subscription" in model or "saas" in model else 0.09
        forecast = []
        for month in range(1, 13):
            forecast.append(
                {
                    "month": f"M{month}",
                    "value": round(base_mrr * ((1 + growth) ** (month - 1))),
                    "churn": round(max(0.02, 0.06 - month * 0.003), 3),
                }
            )
        return forecast

    def churn_probability(self, state: AgentState) -> float:
        _ = state
        return 0.18

    def conversion_rate(self, state: AgentState) -> float:
        _ = state
        return 0.07

    def growth_curve(self, state: AgentState) -> list[float]:
        model = state.get("business_model", "").lower()
        rate = 1.12 if "subscription" in model or "saas" in model else 1.09
        return [round(rate**month, 2) for month in range(12)]
