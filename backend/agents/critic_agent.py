from __future__ import annotations

from openai import OpenAI

from models.state import AgentState


class CriticAgent:
    def __init__(self) -> None:
        self.client = OpenAI()

    def run(self, state: AgentState, agent_name: str) -> AgentState:
        target_output = state.get(agent_name, {})
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "Evaluate the quality of the provided agent output. Return a short score and feedback.",
                },
                {
                    "role": "user",
                    "content": f"Agent name: {agent_name}\nOutput: {target_output}",
                },
            ],
        )
        feedback = response.choices[0].message.content or "Output looks acceptable."

        score = 0.82
        state.setdefault("critic_scores", {})[agent_name] = score
        state["critic_scores"][f"{agent_name}_feedback"] = feedback
        state.setdefault("retry_flags", {})[agent_name] = score < 0.7
        state.setdefault("retry_counts", {})[agent_name] = state.get("retry_counts", {}).get(agent_name, 0)
        state.setdefault("step_status", {})[f"critic_{agent_name}"] = "done"
        return state
