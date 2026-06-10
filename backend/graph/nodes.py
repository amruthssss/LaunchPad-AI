from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

from agents.business_planner_agent import BusinessPlannerAgent
from agents.code_generator_agent import CodeGeneratorAgent
from agents.critic_agent import CriticAgent
from agents.deployment_agent import DeploymentAgent
from agents.forecasting_agent import ForecastingAgent
from agents.knowledge_agent import KnowledgeAgent
from agents.market_research_agent import MarketResearchAgent
from agents.technical_architect_agent import TechnicalArchitectAgent
from models.state import AgentState


def _mark_running(state: AgentState, step_name: str) -> None:
    state.setdefault("step_status", {})[step_name] = "running"


def _mark_done(state: AgentState, step_name: str) -> None:
    state.setdefault("step_status", {})[step_name] = "done"


def _mark_failed(state: AgentState, step_name: str, agent_name: str | None = None) -> None:
    state.setdefault("step_status", {})[step_name] = "failed"
    if agent_name:
        retry_flags = state.setdefault("retry_flags", {})
        retry_counts = state.setdefault("retry_counts", {})
        retry_flags[agent_name] = True
        retry_counts[agent_name] = retry_counts.get(agent_name, 0) + 1


def run_market_research_node(state: AgentState) -> AgentState:
    step_name = "market_research"
    _mark_running(state, step_name)
    try:
        updated_state = MarketResearchAgent().run(state)
        _mark_done(updated_state, step_name)
        return updated_state
    except (ValueError, TypeError, RuntimeError, KeyError, AttributeError) as exc:
        state.setdefault("market_research", {})["error"] = str(exc)
        _mark_failed(state, step_name, step_name)
        return state


def run_business_planner_node(state: AgentState) -> AgentState:
    step_name = "business_planner"
    _mark_running(state, step_name)
    try:
        updated_state = BusinessPlannerAgent().run(state)
        _mark_done(updated_state, step_name)
        return updated_state
    except (ValueError, TypeError, RuntimeError, KeyError, AttributeError) as exc:
        state.setdefault("business_plan", {})["error"] = str(exc)
        _mark_failed(state, step_name, step_name)
        return state


def run_technical_architect_node(state: AgentState) -> AgentState:
    step_name = "technical_architect"
    _mark_running(state, step_name)
    try:
        updated_state = TechnicalArchitectAgent().run(state)
        _mark_done(updated_state, step_name)
        return updated_state
    except (ValueError, TypeError, RuntimeError, KeyError, AttributeError) as exc:
        state.setdefault("tech_architecture", {})["error"] = str(exc)
        _mark_failed(state, step_name, step_name)
        return state


def run_code_generator_node(state: AgentState) -> AgentState:
    step_name = "code_generator"
    _mark_running(state, step_name)
    try:
        updated_state = CodeGeneratorAgent().run(state)
        _mark_done(updated_state, step_name)
        return updated_state
    except (ValueError, TypeError, RuntimeError, KeyError, AttributeError) as exc:
        state.setdefault("generated_code", {})["error"] = str(exc)
        _mark_failed(state, step_name, step_name)
        return state


def run_forecasting_node(state: AgentState) -> AgentState:
    step_name = "forecasting"
    _mark_running(state, step_name)
    try:
        updated_state = ForecastingAgent().run(state)
        _mark_done(updated_state, step_name)
        return updated_state
    except (ValueError, TypeError, RuntimeError, KeyError, AttributeError) as exc:
        state.setdefault("forecast", {})["error"] = str(exc)
        _mark_failed(state, step_name, step_name)
        return state


def run_knowledge_node(state: AgentState) -> AgentState:
    step_name = "knowledge"
    _mark_running(state, step_name)
    try:
        updated_state = KnowledgeAgent().run(state)
        _mark_done(updated_state, step_name)
        return updated_state
    except (ValueError, TypeError, RuntimeError, KeyError, AttributeError) as exc:
        state.setdefault("business_plan", {})["knowledge_error"] = str(exc)
        _mark_failed(state, step_name, step_name)
        return state


def run_deployment_node(state: AgentState) -> AgentState:
    step_name = "deployment"
    _mark_running(state, step_name)
    try:
        updated_state = DeploymentAgent().run(state)
        _mark_done(updated_state, step_name)
        return updated_state
    except (ValueError, TypeError, RuntimeError, KeyError, AttributeError) as exc:
        state.setdefault("deployment_config", {})["error"] = str(exc)
        _mark_failed(state, step_name, step_name)
        return state


def run_critic_node(state: AgentState, agent_name: str) -> AgentState:
    step_name = f"critic_after_{agent_name}"
    _mark_running(state, step_name)
    try:
        updated_state = CriticAgent().run(state, agent_name)
        _mark_done(updated_state, step_name)
        return updated_state
    except (ValueError, TypeError, RuntimeError, KeyError, AttributeError) as exc:
        state.setdefault("critic_scores", {})[f"{agent_name}_feedback"] = str(exc)
        _mark_failed(state, step_name, agent_name)
        return state


def run_code_sandbox_node(state: AgentState) -> AgentState:
    step_name = "code_sandbox"
    _mark_running(state, step_name)
    generated_code = state.get("generated_code", {})
    fastapi_backend = generated_code.get("fastapi_backend", "")

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            script_path = Path(temp_dir) / "fastapi_backend.py"
            script_path.write_text(fastapi_backend, encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(script_path)],
                capture_output=True,
                text=True,
                check=False,
                timeout=30,
            )

        generated_code["sandbox_stdout"] = result.stdout
        generated_code["sandbox_stderr"] = result.stderr

        if result.returncode != 0:
            generated_code["sandbox_error"] = result.stderr or result.stdout or "Sandbox execution failed."
            state.setdefault("retry_flags", {})["code_generator"] = True
            state.setdefault("retry_counts", {})["code_generator"] = state.setdefault("retry_counts", {}).get("code_generator", 0) + 1
            state.setdefault("step_status", {})[step_name] = "failed"
        else:
            generated_code["sandbox_passed"] = True
            state.setdefault("step_status", {})[step_name] = "done"

        state["generated_code"] = generated_code
        return state
    except (subprocess.SubprocessError, OSError, ValueError, TypeError, RuntimeError, KeyError, AttributeError) as exc:
        generated_code["sandbox_error"] = str(exc)
        generated_code["sandbox_stdout"] = generated_code.get("sandbox_stdout", "")
        generated_code["sandbox_stderr"] = generated_code.get("sandbox_stderr", "")
        state.setdefault("retry_flags", {})["code_generator"] = True
        state.setdefault("retry_counts", {})["code_generator"] = state.setdefault("retry_counts", {}).get("code_generator", 0) + 1
        state["generated_code"] = generated_code
        _mark_failed(state, step_name, "code_generator")
        return state


# Backward-compatible aliases for earlier scaffold references.
market_research_node = run_market_research_node
business_planner_node = run_business_planner_node
technical_architect_node = run_technical_architect_node
code_generator_node = run_code_generator_node
forecasting_node = run_forecasting_node
knowledge_node = run_knowledge_node
deployment_node = run_deployment_node
critic_node = run_critic_node

