from __future__ import annotations

import json
import os
import tempfile
from typing import Any

import mlflow
from mlflow.tracking import MlflowClient


EXPERIMENT_NAME = "ai-startup-factory"


def setup_mlflow() -> None:
    tracking_uri = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
    mlflow.set_tracking_uri(tracking_uri)
    client = MlflowClient()
    experiment = client.get_experiment_by_name(EXPERIMENT_NAME)
    if experiment is None:
        client.create_experiment(EXPERIMENT_NAME)
    mlflow.set_experiment(EXPERIMENT_NAME)


def log_agent_run(agent_name: str, inputs: dict, outputs: dict, score: float, runtime_ms: float) -> None:
    session_id = str(inputs.get("session_id", "unknown"))
    with mlflow.start_run(run_name=agent_name):
        mlflow.log_param("agent_name", agent_name)
        mlflow.log_param("session_id", session_id)
        mlflow.log_metric("score", float(score))
        mlflow.log_metric("runtime_ms", float(runtime_ms))

        with tempfile.TemporaryDirectory() as temp_dir:
            artifact_path = os.path.join(temp_dir, f"{agent_name}_output.json")
            with open(artifact_path, "w", encoding="utf-8") as artifact_file:
                json.dump(outputs, artifact_file, ensure_ascii=False, indent=2, default=str)
            mlflow.log_artifact(artifact_path)


def log_forecast(session_id: str, predictions: list) -> None:
    with mlflow.start_run(run_name="forecasting"):
        mlflow.log_param("session_id", session_id)
        mlflow.log_metric("num_predictions", float(len(predictions)))
        with tempfile.TemporaryDirectory() as temp_dir:
            artifact_path = os.path.join(temp_dir, "forecast.json")
            with open(artifact_path, "w", encoding="utf-8") as artifact_file:
                json.dump(predictions, artifact_file, ensure_ascii=False, indent=2, default=str)
            mlflow.log_artifact(artifact_path)


def get_agent_metrics(agent_name: str) -> dict[str, float]:
    client = MlflowClient()
    experiment = client.get_experiment_by_name(EXPERIMENT_NAME)
    if experiment is None:
        return {"average_score": 0.0, "average_runtime_ms": 0.0, "total_runs": 0.0}

    runs = client.search_runs(
        experiment_ids=[experiment.experiment_id],
        filter_string=f"tags.mlflow.runName = '{agent_name}'",
        max_results=1000,
    )

    if not runs:
        return {"average_score": 0.0, "average_runtime_ms": 0.0, "total_runs": 0.0}

    scores = [float(run.data.metrics.get("score", 0.0)) for run in runs]
    runtimes = [float(run.data.metrics.get("runtime_ms", 0.0)) for run in runs]
    return {
        "average_score": sum(scores) / len(scores),
        "average_runtime_ms": sum(runtimes) / len(runtimes),
        "total_runs": float(len(runs)),
    }
