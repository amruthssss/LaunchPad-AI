from __future__ import annotations

from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI

from models.state import AgentState


class TechnicalArchitectAgent:
    def __init__(self) -> None:
        self.llm = ChatOpenAI(model="gpt-4o", temperature=0)

    def run(self, state: AgentState) -> AgentState:
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "Design a startup platform architecture. Include frontend, backend, database, deployment, schema, endpoints, and a Mermaid diagram.",
                ),
                ("human", "Idea: {idea}\nBusiness plan: {business_plan}"),
            ]
        )

        response = self.llm.invoke(
            prompt.format_messages(
                idea=state.get("idea", "Unknown startup idea"),
                business_plan=state.get("business_plan", {}),
            )
        )
        architecture_summary = getattr(response, "content", "") or "Proposed architecture ready."

        state["tech_architecture"] = {
            "frontend": "React, Vite, Tailwind CSS, React Flow",
            "backend": "Python, FastAPI, LangGraph, LangChain, OpenAI GPT-4",
            "database": "PostgreSQL, Redis, ChromaDB",
            "deployment": "Docker and Docker Compose",
            "db_schema": {
                "startup_runs": ["id", "idea", "industry", "status", "created_at"],
                "agent_outputs": ["id", "startup_run_id", "agent_name", "payload"],
            },
            "api_endpoints": [
                "POST /api/startup/run",
                "GET /api/startup/sample",
                "WS /api/startup/ws/{startup_name}",
            ],
            "mermaid_diagram": (
                "flowchart LR\n"
                "  UI[React Frontend] --> API[FastAPI Backend]\n"
                "  API --> PG[(PostgreSQL)]\n"
                "  API --> REDIS[(Redis)]\n"
                "  API --> CHROMA[(ChromaDB)]\n"
                "  API --> ML[MLflow]"
            ),
            "summary": architecture_summary,
        }
        state.setdefault("step_status", {})["tech_architecture"] = "done"
        return state
