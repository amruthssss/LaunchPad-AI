from __future__ import annotations

from config import settings
from models.state import AgentState
from services.heuristics import estimate_tam_musd, format_money_musd, get_market_profile
from services.llm import optional_completion


class MarketResearchAgent:
    def run(self, state: AgentState) -> AgentState:
        idea = state.get("idea", "A new digital product")
        industry = state.get("industry", "Technology")
        audience = state.get("target_audience") or "early adopters and small teams"
        profile = get_market_profile(industry)
        tam = estimate_tam_musd(industry, state.get("business_model", ""), idea)
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
            "competitors": list(profile.competitors), "market_size": summary,
            "research_brief": research or "Add an OPENAI_API_KEY to enrich this directional research with an AI generated brief.",
            "tam_musd": tam, "estimated_cagr_percent": profile.cagr_percent,
            "trends": ["AI-assisted workflows", "vertical software", "outcome-based pricing"],
            "customer_problems": [f"{audience} face {pain}" for pain in profile.pain_points],
            "sources": [], "assumptions": ["Directional category estimate; not investment-grade research."],
        }
        return state
