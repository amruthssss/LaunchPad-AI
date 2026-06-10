from __future__ import annotations

from forecasting.forecasting_engine import ForecastingEngine
from models.state import AgentState


class ForecastingAgent:
    def __init__(self) -> None:
        self.engine = ForecastingEngine()

    def run(self, state: AgentState) -> AgentState:
        revenue_forecast = self.engine.revenue_forecast(state)
        churn_probability = self.engine.churn_probability(state)
        conversion_rate = self.engine.conversion_rate(state)
        growth_curve = self.engine.growth_curve(state)

        state["forecast"] = {
            "revenue_forecast": revenue_forecast,
            "churn_probability": churn_probability,
            "conversion_rate": conversion_rate,
            "growth_curve": growth_curve,
        }
        state.setdefault("step_status", {})["forecast"] = "done"
        return state
