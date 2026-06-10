from __future__ import annotations

from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI

from models.state import AgentState


class BusinessPlannerAgent:
    def __init__(self) -> None:
        self.llm = ChatOpenAI(model="gpt-4o", temperature=0)

    def run(self, state: AgentState) -> AgentState:
        market_research = state.get("market_research", {})
        idea = state.get("idea", "Unknown startup idea")

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "Create a business model canvas using the provided market research. Return concise, actionable bullets.",
                ),
                (
                    "human",
                    "Idea: {idea}\nMarket research: {market_research}",
                ),
            ]
        )

        response = self.llm.invoke(prompt.format_messages(idea=idea, market_research=market_research))
        value_proposition = getattr(response, "content", "") or "Build and validate startup ideas faster."

        state["business_plan"] = {
            "value_proposition": value_proposition,
            "customer_segments": [state.get("target_audience", "startup founders")],
            "revenue_streams": ["subscription", "services", "usage-based pricing"],
            "cost_structure": ["LLM usage", "infrastructure", "sales and support"],
            "key_activities": ["research", "planning", "execution automation"],
            "validation_score": 84,
        }
        state.setdefault("step_status", {})["business_plan"] = "done"
        return state
