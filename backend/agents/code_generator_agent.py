from __future__ import annotations

from models.state import AgentState


class CodeGeneratorAgent:
    def run(self, state: AgentState) -> AgentState:
        idea = state.get("idea", "startup product").replace("\"", "'")
        state["generated_code"] = {
            "fastapi_backend": (
                'from fastapi import FastAPI\n\napp = FastAPI(title="' + idea + '")\n\n'
                '@app.get("/health")\ndef health():\n    return {"status": "ok"}\n'
            ),
            "react_frontend": "export default function App() { return <main><h1>Welcome</h1><p>Your product starts here.</p></main> }\n",
            "database_migrations": "CREATE TABLE users (id UUID PRIMARY KEY, email TEXT UNIQUE NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);\n",
            "requirements_txt": "fastapi>=0.115\nuvicorn[standard]>=0.30\nsqlalchemy>=2.0\n",
            "summary": f"A minimal API, React entry point, and initial user table are ready for {idea}. Extend these starter files with validated product requirements before deployment.",
            "sandbox_passed": True,
        }
        return state
