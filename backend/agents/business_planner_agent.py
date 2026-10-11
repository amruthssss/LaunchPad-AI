from __future__ import annotations

from models.state import AgentState


class BusinessPlannerAgent:
    def run(self, state: AgentState) -> AgentState:
        idea = state.get("idea", "the product")
        audience = state.get("target_audience") or "small teams and early adopters"
        model = state.get("business_model") or "Subscription"
        state["business_plan"] = {
            "executive_summary": f"{idea} helps {audience} solve a recurring problem with a focused, easy-to-adopt product.",
            "value_proposition": f"A faster, simpler way for {audience} to get a measurable result without fragmented workflows.",
            "customer_segments": [audience, "Adjacent teams with the same workflow"],
            "revenue_streams": [f"{model} plans", "Team and enterprise upgrades", "Usage-based add-ons"],
            "cost_structure": ["Product and engineering", "Cloud and AI usage", "Customer acquisition and support"],
            "key_activities": ["Customer discovery", "Product development", "Activation and retention experiments"],
            "go_to_market": ["Interview 15 target customers", "Launch a focused pilot", "Measure activation, retention, and willingness to pay"],
            "risks": ["Unvalidated willingness to pay", "Crowded alternatives", "Acquisition costs may exceed early customer value"],
            "validation_score": 78,
        }
        return state
