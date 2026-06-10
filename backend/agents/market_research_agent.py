from __future__ import annotations

from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults

from models.state import AgentState


class MarketResearchAgent:
    def __init__(self) -> None:
        self.llm = ChatOpenAI(model="gpt-4o", temperature=0)
        self.search_tool = TavilySearchResults(max_results=5)

    def run(self, state: AgentState) -> AgentState:
        idea = state.get("idea", "Unknown startup idea")
        industry = state.get("industry", "general")
        target_audience = state.get("target_audience", "general users")

        search_results = self.search_tool.invoke({"query": f"{idea} competitors market trends {industry}"})

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a startup market researcher. Summarize competitors, market size, trends, and customer pain points.",
                ),
                (
                    "human",
                    "Idea: {idea}\nIndustry: {industry}\nAudience: {target_audience}\nSearch results: {search_results}",
                ),
            ]
        )

        response = self.llm.invoke(
            prompt.format_messages(
                idea=idea,
                industry=industry,
                target_audience=target_audience,
                search_results=search_results,
            )
        )
        summary = getattr(response, "content", "") or "Market research completed."

        state["market_research"] = {
            "competitors": ["Competitor A", "Competitor B"],
            "market_size": summary,
            "trends": ["AI automation", "agent orchestration", "workflow intelligence"],
            "customer_problems": [
                f"{target_audience} need faster startup validation",
                f"{industry} teams need structured execution",
            ],
            "search_results": search_results,
        }
        state.setdefault("step_status", {})["market_research"] = "done"
        return state
