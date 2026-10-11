from __future__ import annotations

from models.state import AgentState


class TechnicalArchitectAgent:
    def run(self, state: AgentState) -> AgentState:
        state["tech_architecture"] = {
            "frontend": "React 18 + Vite + Tailwind CSS",
            "backend": "FastAPI REST API + LangGraph orchestration",
            "database": "PostgreSQL in production; SQLite for local development",
            "cache": "Redis (optional; in-memory fallback for local development)",
            "deployment": "Independent web hosting with a managed PostgreSQL service",
            "db_schema": {"startup_sessions": ["id", "idea", "industry", "status", "config", "final_report", "created_at"]},
            "api_endpoints": ["POST /api/startup/generate", "GET /api/startup/{id}/status", "GET /api/startup/{id}/report", "GET /api/startup/history", "WS /ws/{id}"],
            "mermaid_diagram": "flowchart LR\n  UI[React dashboard] --> API[FastAPI]\n  API --> GRAPH[LangGraph pipeline]\n  API --> DB[(PostgreSQL / SQLite)]\n  API --> CACHE[(Redis / memory)]",
            "summary": "A modular web application with a streaming agent workflow, durable session records, and graceful local-development defaults.",
        }
        return state
