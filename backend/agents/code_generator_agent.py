from __future__ import annotations

from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI

from models.state import AgentState


class CodeGeneratorAgent:
    def __init__(self) -> None:
        self.llm = ChatOpenAI(model="gpt-4o", temperature=0)

    def run(self, state: AgentState) -> AgentState:
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "Generate starter code for a startup factory application. Return backend Python, frontend JSX, SQL migrations, and requirements text.",
                ),
                ("human", "Idea: {idea}\nArchitecture: {tech_architecture}\nBusiness plan: {business_plan}"),
            ]
        )

        response = self.llm.invoke(
            prompt.format_messages(
                idea=state.get("idea", "Unknown startup idea"),
                tech_architecture=state.get("tech_architecture", {}),
                business_plan=state.get("business_plan", {}),
            )
        )
        generated_summary = getattr(response, "content", "") or "Generated starter code prepared."

        state["generated_code"] = {
            "fastapi_backend": (
                "from fastapi import FastAPI\n\n"
                "app = FastAPI()\n\n"
                "@app.get(\"/health\")\n"
                "def health() -> dict[str, str]:\n"
                "    return {\"status\": \"ok\"}\n"
            ),
            "react_frontend": (
                "export default function App() {\n"
                "  return <main>AI Startup Factory</main>;\n"
                "}\n"
            ),
            "database_migrations": (
                "CREATE TABLE startup_runs (\n"
                "  id SERIAL PRIMARY KEY,\n"
                "  idea TEXT NOT NULL,\n"
                "  industry TEXT NOT NULL\n"
                ");\n"
            ),
            "requirements_txt": (
                "fastapi\n"
                "uvicorn[standard]\n"
                "langchain\n"
                "langgraph\n"
                "openai\n"
            ),
            "summary": generated_summary,
        }
        state.setdefault("step_status", {})["generated_code"] = "done"
        return state
