from __future__ import annotations

from dataclasses import dataclass

import mlflow

from models.state import AgentState


@dataclass
class ForecastingEngine:
    model_name: str = "startup-demand-forecast"

    def revenue_forecast(self, state: AgentState) -> list[dict[str, float | str]]:
        idea_length = max(len(state.get("idea", "")), 1)
        return [
            {"month": "M1", "value": float(idea_length * 1000)},
            {"month": "M2", "value": float(idea_length * 1300)},
            {"month": "M3", "value": float(idea_length * 1700)},
        ]

    def churn_probability(self, state: AgentState) -> float:
        _ = state
        return 0.18

    def conversion_rate(self, state: AgentState) -> float:
        _ = state
        return 0.07

    def growth_curve(self, state: AgentState) -> list[float]:
        _ = state
        return [1.0, 1.25, 1.58, 1.95, 2.4, 3.0]

    def log_experiment(self, metrics: dict[str, float]) -> None:
        with mlflow.start_run(run_name=self.model_name):
            for key, value in metrics.items():
                mlflow.log_metric(key, value)
