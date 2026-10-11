from __future__ import annotations

from models.state import AgentState


class CriticAgent:
    def run(self, state: AgentState, agent_name: str) -> AgentState:
        output = state.get(agent_name, {})
        populated = sum(bool(value) for value in output.values()) if isinstance(output, dict) else bool(output)
        score = min(0.94, 0.68 + populated * 0.045)
        feedback = "Useful first-pass output. Validate assumptions with target customers and current market sources."
        state.setdefault("critic_scores", {})[agent_name] = round(score, 2)
        state["critic_scores"][f"{agent_name}_feedback"] = feedback
        state.setdefault("retry_flags", {})[agent_name] = False
        state.setdefault("retry_counts", {})[agent_name] = 0
        return state
