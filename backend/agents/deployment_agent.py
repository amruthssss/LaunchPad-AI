from __future__ import annotations

from models.state import AgentState


class DeploymentAgent:
    def run(self, state: AgentState) -> AgentState:
        state["deployment_config"] = {
            "procfile": "web: uvicorn main:app --host 0.0.0.0 --port $PORT\n",
            "railway_toml": "[build]\nbuilder = \"NIXPACKS\"\n\n[deploy]\nstartCommand = \"uvicorn main:app --host 0.0.0.0 --port $PORT\"\nhealthcheckPath = \"/\"\n",
            "github_actions_yml": "name: Build\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: npm\n          cache-dependency-path: frontend/package-lock.json\n      - run: npm ci\n        working-directory: frontend\n      - run: npm run build\n        working-directory: frontend\n",
            "netlify_toml": "[build]\n  base = \"frontend\"\n  command = \"npm run build\"\n  publish = \"dist\"\n",
            "summary": "Platform deployment and CI starter configuration generated. Configure production secrets and persistent storage before launch.",
        }
        return state
