from __future__ import annotations

from models.state import AgentState
from services.heuristics import estimate_tam_musd, format_money_musd, get_market_profile
from services.llm import openrouter_market_research


class MarketResearchAgent:
    def run(self, state: AgentState) -> AgentState:
        idea = state.get("idea", "A new digital product")
        industry = state.get("industry", "Technology")
        audience = state.get("target_audience") or "early adopters and small teams"
        profile = get_market_profile(industry)
        tam = estimate_tam_musd(industry, state.get("business_model", ""), idea)
        research_result = openrouter_market_research(
            idea=idea,
            industry=industry,
            audience=audience,
            country=state.get("country", ""),
            business_model=state.get("business_model", ""),
        )
        summary = (
            f"A directional estimate for the {industry.lower()} market is {format_money_musd(tam)}. "
            f"The category is growing at roughly {profile.cagr_percent}% annually. "
            "Validate the reachable segment with customer interviews and current local data before investing."
        )
        has_ai_result = bool(research_result and research_result.get("research_brief"))
        research_status = research_result.get("research_status", "ungrounded") if research_result else "not_configured"
        research_error = research_result.get("research_error", "") if research_result else ""
        fallback_brief = (
            f"{research_error} Showing directional industry heuristics instead."
            if research_error else
            "OpenRouter is not configured. Showing directional industry heuristics instead."
            if not research_result else "OpenRouter research is unavailable. Showing directional industry heuristics instead."
        )
        state["market_research"] = {
            "competitors": research_result.get("competitors") if has_ai_result and research_result.get("competitors") else list(profile.competitors),
            "market_size": research_result.get("market_size") if has_ai_result else summary,
            "research_brief": (
                research_result["research_brief"] if has_ai_result else fallback_brief
            ),
            "tam_musd": tam, "estimated_cagr_percent": profile.cagr_percent,
            "trends": research_result.get("trends") if has_ai_result and research_result.get("trends") else ["AI-assisted workflows", "vertical software", "outcome-based pricing"],
            "customer_problems": research_result.get("customer_problems") if has_ai_result and research_result.get("customer_problems") else [f"{audience} face {pain}" for pain in profile.pain_points],
            "sources": [],
            "search_queries": [],
            "research_status": research_status,
            "research_provider": research_result.get("research_provider", "") if research_result else "",
            "research_error": research_error,
            "assumptions": ["The displayed TAM is a heuristic directional estimate, not a sourced market figure."],
        }
        return state
