from __future__ import annotations

import json
from collections.abc import AsyncGenerator

from langgraph.graph import END, StateGraph

from graph.nodes import (
    run_business_planner_node,
    run_code_generator_node,
    run_code_sandbox_node,
    run_critic_node,
    run_deployment_node,
    run_forecasting_node,
    run_knowledge_node,
    run_market_research_node,
    run_technical_architect_node,
)
from models.state import AgentState


def _route_after_critic(agent_name: str):
    def _router(state: AgentState) -> str:
        retry_flags = state.get("retry_flags", {})
        retry_counts = state.get("retry_counts", {})
        should_retry = retry_flags.get(agent_name, False) and retry_counts.get(agent_name, 0) < 2
        return agent_name if should_retry else {
            "market_research": "business_planner",
            "business_planner": "technical_architect",
            "technical_architect": "code_generator",
        }[agent_name]

    return _router


def build_workflow():
    graph = StateGraph(AgentState)
    graph.add_node("market_research", run_market_research_node)
    graph.add_node("critic_after_market_research", lambda state: run_critic_node(state, "market_research"))
    graph.add_node("business_planner", run_business_planner_node)
    graph.add_node("critic_after_business_planner", lambda state: run_critic_node(state, "business_planner"))
    graph.add_node("technical_architect", run_technical_architect_node)
    graph.add_node("critic_after_technical_architect", lambda state: run_critic_node(state, "technical_architect"))
    graph.add_node("code_generator", run_code_generator_node)
    graph.add_node("code_sandbox", run_code_sandbox_node)
    graph.add_node("forecasting", run_forecasting_node)
    graph.add_node("knowledge", run_knowledge_node)
    graph.add_node("deployment", run_deployment_node)

    graph.set_entry_point("market_research")
    graph.add_edge("market_research", "critic_after_market_research")
    graph.add_conditional_edges(
        "critic_after_market_research",
        _route_after_critic("market_research"),
        {
            "market_research": "market_research",
            "business_planner": "business_planner",
        },
    )
    graph.add_edge("business_planner", "critic_after_business_planner")
    graph.add_conditional_edges(
        "critic_after_business_planner",
        _route_after_critic("business_planner"),
        {
            "business_planner": "business_planner",
            "technical_architect": "technical_architect",
        },
    )
    graph.add_edge("technical_architect", "critic_after_technical_architect")
    graph.add_conditional_edges(
        "critic_after_technical_architect",
        _route_after_critic("technical_architect"),
        {
            "technical_architect": "technical_architect",
            "code_generator": "code_generator",
        },
    )
    graph.add_edge("code_generator", "code_sandbox")
    graph.add_edge("code_sandbox", "forecasting")
    graph.add_edge("forecasting", "knowledge")
    graph.add_edge("knowledge", "deployment")
    graph.add_edge("deployment", END)

    return graph.compile()


async def run_workflow(idea: str, config: dict) -> AsyncGenerator[str, None]:
    state: AgentState = {
        "idea": idea,
        "industry": config.get("industry", ""),
        "target_audience": config.get("target_audience", ""),
        "country": config.get("country", ""),
        "business_model": config.get("business_model", ""),
        "session_id": config.get("session_id", ""),
        "market_research": {},
        "business_plan": {},
        "tech_architecture": {},
        "generated_code": {},
        "forecast": {},
        "deployment_config": {},
        "critic_scores": {},
        "retry_flags": {},
        "retry_counts": {},
        "step_status": {},
    }

    workflow = build_workflow()
    stream_config = {"configurable": config or {}}

    async for event in workflow.astream_events(state, config=stream_config, version="v2"):
        name = event.get("name", "workflow")
        if name not in {
            "market_research",
            "critic_after_market_research",
            "business_planner",
            "critic_after_business_planner",
            "technical_architect",
            "critic_after_technical_architect",
            "code_generator",
            "code_sandbox",
            "forecasting",
            "knowledge",
            "deployment",
        }:
            continue

        event_type = event.get("event", "")
        if event_type.endswith("start"):
            payload = {
                "step": name,
                "status": "running",
                "output": event.get("data", {}).get("input", {}) or {},
            }
        else:
            output = event.get("data", {}).get("output", {})
            if not isinstance(output, dict):
                output = {"value": output}
            payload = {"step": name, "status": "done", "output": output}
        yield json.dumps(payload, ensure_ascii=False)
