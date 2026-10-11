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
        state["market_research"] = {
            "competitors": grounded["competitors"] if grounded else list(profile.competitors),
            "market_size": grounded["market_size"] if grounded else summary,
            "research_brief": (
                grounded["research_brief"] if grounded else
                research or "Live web research is not configured. Add GEMINI_API_KEY to get idea-specific research with Google Search sources."
            ),
            "tam_musd": tam, "estimated_cagr_percent": profile.cagr_percent,
            "trends": grounded["trends"] if grounded else ["AI-assisted workflows", "vertical software", "outcome-based pricing"],
            "customer_problems": grounded["customer_problems"] if grounded else [f"{audience} face {pain}" for pain in profile.pain_points],
            "sources": grounded["sources"] if grounded else [],
            "search_queries": grounded["search_queries"] if grounded else [],
            "research_status": grounded["research_status"] if grounded else "heuristic",
            "assumptions": ["The displayed TAM is a heuristic directional estimate, not a sourced market figure."],
        }
        return state
