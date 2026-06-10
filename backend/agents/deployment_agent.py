from __future__ import annotations

from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI

from models.state import AgentState


class DeploymentAgent:
    def __init__(self) -> None:
        self.llm = ChatOpenAI(model="gpt-4o", temperature=0)

    def run(self, state: AgentState) -> AgentState:
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "Generate deployment files for a production-ready startup factory project. Return Dockerfile, docker-compose, GitHub Actions, and Render config.",
                ),
                ("human", "Idea: {idea}\nArchitecture: {tech_architecture}\nGenerated code: {generated_code}"),
            ]
        )

        response = self.llm.invoke(
            prompt.format_messages(
                idea=state.get("idea", "Unknown startup idea"),
                tech_architecture=state.get("tech_architecture", {}),
                generated_code=state.get("generated_code", {}),
            )
        )
        deployment_summary = getattr(response, "content", "") or "Deployment artifacts generated."

        state["deployment_config"] = {
            "dockerfile": "FROM python:3.12-slim\nWORKDIR /app\nCOPY . /app\nCMD [\"uvicorn\", \"backend.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]\n",
            "docker_compose": "services:\n  api:\n    build: ./backend\n",
            "github_actions_yml": "name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n",
            "render_config": "services:\n  - type: web\n    name: ai-startup-factory\n",
            "summary": deployment_summary,
        }
        state.setdefault("step_status", {})["deployment"] = "done"
        return state
