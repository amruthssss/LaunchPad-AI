from __future__ import annotations

from rag.rag_pipeline import query_knowledge
from models.state import AgentState


class KnowledgeAgent:
    def run(self, state: AgentState) -> AgentState:
        query = " ".join(
            [
                state.get("idea", ""),
                state.get("industry", ""),
                state.get("target_audience", ""),
            ]
        ).strip()
        knowledge_chunks = query_knowledge(query=query or "startup best practices", top_k=3)

        state.setdefault("business_plan", {})["knowledge_context"] = knowledge_chunks[:3]
        state.setdefault("step_status", {})["knowledge"] = "done"
        return state
