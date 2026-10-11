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
    stream_config = {"configurable": {"session_id": state.get("session_id", "")}}

    def next_step(name: str) -> str | None:
        if name == "market_research":
            return "critic_after_market_research"
        if name == "critic_after_market_research":
            return "market_research" if _route_after_critic("market_research")(state) == "market_research" else "business_planner"
        if name == "business_planner":
            return "critic_after_business_planner"
        if name == "critic_after_business_planner":
            return "business_planner" if _route_after_critic("business_planner")(state) == "business_planner" else "technical_architect"
        if name == "technical_architect":
            return "critic_after_technical_architect"
        if name == "critic_after_technical_architect":
            return "technical_architect" if _route_after_critic("technical_architect")(state) == "technical_architect" else "code_generator"
        return {"code_generator": "code_sandbox", "code_sandbox": "forecasting", "forecasting": "knowledge", "knowledge": "deployment"}.get(name)

    state.setdefault("step_status", {})["market_research"] = "running"
    from memory.redis_client import set_state
    set_state(state.get("session_id", ""), state)
    yield json.dumps({"step": "market_research", "status": "running", "output": {}}, ensure_ascii=False)
    async for update in workflow.astream(state, config=stream_config, stream_mode="updates"):
        for name, output in update.items():
            if not isinstance(output, dict):
                continue
            state.update(output)
            step_status = output.get("step_status", {})
            state.setdefault("step_status", {})[name] = step_status.get(name, "done")
            set_state(state.get("session_id", ""), state)
            yield json.dumps(
                {"step": name, "status": state["step_status"][name], "output": output}, ensure_ascii=False, default=str
            )
            following = next_step(name)
            if following:
                state["step_status"][following] = "running"
                set_state(state.get("session_id", ""), state)
                yield json.dumps({"step": following, "status": "running", "output": {}}, ensure_ascii=False)
