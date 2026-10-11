from __future__ import annotations

from config import settings
from models.state import AgentState
from services.heuristics import estimate_tam_musd, format_money_musd, get_market_profile
from services.llm import grounded_market_research, optional_completion


class MarketResearchAgent:
    def run(self, state: AgentState) -> AgentState:
        idea = state.get("idea", "A new digital product")
        industry = state.get("industry", "Technology")
        audience = state.get("target_audience") or "early adopters and small teams"
        profile = get_market_profile(industry)
        tam = estimate_tam_musd(industry, state.get("business_model", ""), idea)
        grounded = grounded_market_research(
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
        research = optional_completion(
            "You are a pragmatic startup market researcher. In 3 concise sentences, identify likely alternatives, a specific customer pain, and one assumption to validate. Do not invent market-size statistics.",
            f"Idea: {idea}\nIndustry: {industry}\nAudience: {audience}\nBusiness model: {state.get('business_model', '')}",
        )
        has_gemini_result = bool(grounded and "research_brief" in grounded)
        research_status = (
            grounded.get("research_status", "ungrounded") if grounded else
            "not_configured" if not settings.gemini_api_key else "unavailable"
        )
        research_error = grounded.get("research_error", "") if grounded else ""
        fallback_brief = (
            f"{research_error} Showing directional industry heuristics instead."
            if research_error else
            research or "Live web research is not configured. Add GEMINI_API_KEY to get idea-specific research with Google Search sources."
        )
        state["market_research"] = {
            "competitors": grounded["competitors"] if has_gemini_result and grounded["competitors"] else list(profile.competitors),
            "market_size": grounded["market_size"] if has_gemini_result else summary,
            "research_brief": (
                grounded["research_brief"] if has_gemini_result else fallback_brief
            ),
            "tam_musd": tam, "estimated_cagr_percent": profile.cagr_percent,
            "trends": grounded["trends"] if has_gemini_result and grounded["trends"] else ["AI-assisted workflows", "vertical software", "outcome-based pricing"],
            "customer_problems": grounded["customer_problems"] if has_gemini_result and grounded["customer_problems"] else [f"{audience} face {pain}" for pain in profile.pain_points],
            "sources": grounded.get("sources", []) if grounded else [],
            "search_queries": grounded.get("search_queries", []) if grounded else [],
            "research_status": research_status,
            "research_error": research_error,
            "assumptions": ["The displayed TAM is a heuristic directional estimate, not a sourced market figure."],
        }
        return state
