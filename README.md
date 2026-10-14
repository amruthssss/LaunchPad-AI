# LaunchPad AI

LaunchPad AI turns a startup idea into a practical first-pass launch plan. A live agent workflow researches the category, shapes a business model, drafts a product architecture and starter code, builds a directional forecast, and prepares a deployment checklist. Progress streams to an animated React dashboard over WebSockets.

The project runs locally without API keys. Built-in heuristics provide starter outputs; `OPENROUTER_API_KEY` enables idea-specific AI research. OpenRouter responses do not include live web citations. Market sizing and forecasts remain directional estimates and should be verified before making decisions.

## What you get

- Responsive, animated React 18 and Vite interface with live progress, research, business plan, architecture, code, and forecast panels.
- FastAPI API with session history, report retrieval, PDF text ingestion, and WebSocket updates.
- LangGraph stages for market research, business planning, architecture, code generation, syntax validation, forecasting, knowledge retrieval, and deployment planning.
- SQLite and in-memory session defaults for local development. PostgreSQL and Redis are optional.
- OpenRouter Nemotron reasoning for idea-specific research with `OPENROUTER_API_KEY`.
- Heuristic research when OpenRouter is not configured or unavailable.

## Quick start

Use Python 3.12+ and Node.js 20+.

```powershell
# Terminal 1 — API
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API is at [http://localhost:8000](http://localhost:8000), with interactive docs at [http://localhost:8000/docs](http://localhost:8000/docs).

The API uses `backend/launchpad.db` and in-memory session storage by default. Set `OPENROUTER_API_KEY` in `backend/.env` to enable AI-generated research; `OPENROUTER_MODEL` defaults to `nvidia/nemotron-3-ultra-550b-a55b:free`. OpenRouter responses have no live web citations, so generated claims should be verified. OpenRouter's free NVIDIA endpoint says request data may be logged and used to improve its products; avoid sending confidential or personal data. If OpenRouter is missing or unavailable, the app displays directional industry heuristics. To use PostgreSQL or Redis, set `DATABASE_URL` and `REDIS_URL` before starting the API.

## Workflow

```text
Idea → Market research → Critic review → Business plan → Critic review
     → Architecture → Critic review → Code generation → Syntax validation
     → Forecast → Knowledge context → Deployment checklist
```

Sessions and reports are saved in the configured database. With local defaults, live session state lasts for the life of the API process; database history remains available across restarts.

## Configuration

Copy `.env.example` to `backend/.env` for optional settings. The API loads `.env` from its working directory.

| Variable | Purpose |
| --- | --- |
| `OPENROUTER_API_KEY` | OpenRouter AI-generated research; responses have no live web citations |
| `OPENROUTER_MODEL` | OpenRouter model; defaults to `nvidia/nemotron-3-ultra-550b-a55b:free` |
| `DATABASE_URL` | SQLAlchemy database URL; defaults to SQLite |
| `REDIS_URL` | Optional Redis session storage; falls back to memory |
| `CORS_ORIGINS` | Comma-separated allowed browser origins |
| `GITHUB_TOKEN` | GitHub repository creation |
| `NOTION_TOKEN`, `NOTION_PARENT_PAGE_ID` | Notion page export |
| `SLACK_WEBHOOK_URL` | Slack message delivery |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Email delivery |

Never commit real secrets or `.env` files.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/startup/generate` | Create a startup session |
| `GET` | `/api/startup/{session_id}/status` | Read stage status and outputs |
| `GET` | `/api/startup/{session_id}/report` | Retrieve the saved report |
| `POST` | `/api/startup/{session_id}/upload-pdf` | Extract and index PDF text for the session |
| `GET` | `/api/startup/history` | List saved sessions |
| `WS` | `/ws/{session_id}` | Stream workflow progress and outputs |
| `POST` | `/api/automation/github` | Create a private GitHub repository |
| `POST` | `/api/automation/notion` | Create a Notion page |
| `POST` | `/api/automation/email` | Send a report email |
| `POST` | `/api/automation/slack` | Send a Slack message |

## Project layout

```text
backend/       FastAPI API, workflow, agents, storage, and forecasting
frontend/      React + Vite animated application
.env.example   Optional local configuration
```

## Notes

- Local heuristics are used when model credentials are missing or unavailable.
- PDF text is indexed in memory for the active API process.
- Configure the credentials for an integration before using its dashboard action.
- SQLite database files are created under the backend directory and are excluded from Git.
