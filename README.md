<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=32&pause=1000&color=6366F1&center=true&vCenter=true&width=600&lines=LaunchPad+AI;Idea+%E2%86%92+Market+Research;Idea+%E2%86%92+Business+Plan;Idea+%E2%86%92+Code+%2B+Deployment;All+Streamed+Live+%F0%9F%9A%80" alt="Typing SVG" />

### Turn a startup idea into a market analysis, business plan, architecture, code, and forecast — orchestrated by a live LangGraph agent pipeline.

<br/>

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

![GitHub last commit](https://img.shields.io/github/last-commit/amruthssss/LaunchPad-AI?style=flat-square&color=6366F1)
![GitHub repo size](https://img.shields.io/github/repo-size/amruthssss/LaunchPad-AI?style=flat-square&color=6366F1)
![GitHub stars](https://img.shields.io/github/stars/amruthssss/LaunchPad-AI?style=flat-square&color=6366F1)
![License](https://img.shields.io/badge/license-MIT-6366F1?style=flat-square)

</div>

<br/>

## ✨ What it does

```
  💡 idea  ──▶  🔍 Market Research  ──▶  📋 Business Plan  ──▶  🏗️  Architecture
                                                                      │
  🚀 Deploy  ◀──  📈 Forecast  ◀──  🧠 Critic Review  ◀──  💻 Code Gen ◀┘
```

Submit an idea from the dashboard → a **LangGraph** pipeline of specialized agents runs in sequence → every step streams live to the frontend over **WebSockets** → final report is saved to Postgres for later.

<br/>

## 🧰 Tech Stack

<div align="center">

| Layer | Stack |
|:---|:---|
| 🔗 **Orchestration** | LangGraph · LangChain · OpenAI · Tavily |
| ⚙️ **Backend** | FastAPI · WebSockets · SQLAlchemy |
| 🗄️ **Data** | PostgreSQL · Redis · ChromaDB (RAG) |
| 📊 **Forecasting** | Prophet · XGBoost · LightGBM · TensorFlow |
| 📈 **Tracking** | MLflow |
| 🎨 **Frontend** | React 18 · Vite · Zustand · Tailwind CSS |
| 🖼️ **Visuals** | React Flow · Recharts · Mermaid |
| 📦 **Deploy** | Docker Compose |

</div>

<br/>

## 🗂️ Project Structure

<details>
<summary><b>Click to expand full tree</b></summary>

```
LaunchPad-AI/
├── backend/
│   ├── main.py                  # FastAPI entrypoint + WebSocket status endpoint
│   ├── config.py                # Env-driven settings
│   ├── agents/                  # 🤖 One module per pipeline agent
│   │   ├── market_research_agent.py
│   │   ├── business_planner_agent.py
│   │   ├── technical_architect_agent.py
│   │   ├── code_generator_agent.py
│   │   ├── forecasting_agent.py
│   │   ├── critic_agent.py
│   │   ├── deployment_agent.py
│   │   └── knowledge_agent.py
│   ├── graph/
│   │   ├── workflow.py          # LangGraph workflow definition
│   │   └── nodes.py             # Node wiring
│   ├── api/
│   │   ├── startup.py           # /api/startup routes
│   │   └── automation.py        # /api/{github,notion,email,slack}
│   ├── automation/               # 🔌 3rd-party integrations
│   ├── db/                       # SQLAlchemy models
│   ├── memory/                   # Redis session state
│   ├── rag/                      # ChromaDB ingestion + retrieval
│   ├── forecasting/               # Forecasting engine
│   ├── monitoring/                # MLflow hooks
│   ├── models/                    # Pydantic schemas
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Home, Dashboard, History
│   │   ├── components/            # Graph view, cards, charts, tabs
│   │   ├── hooks/                 # useStartup, useWebSocket
│   │   ├── store/                 # Zustand store
│   │   └── main.jsx / App.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

</details>

<br/>

## ⚡ Quick Start

<table>
<tr>
<td width="50%" valign="top">

### 🐳 With Docker (recommended)

```bash
git clone https://github.com/amruthssss/LaunchPad-AI
cd LaunchPad-AI
cp .env.example .env
# fill in your API keys
docker compose up --build
```

</td>
<td width="50%" valign="top">

### 🛠️ Without Docker

```bash
# backend
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# frontend (new terminal)
cd frontend
npm install
npm run dev
```

</td>
</tr>
</table>

<div align="center">

| Service | URL |
|:---|:---|
| 🎨 Frontend | http://localhost:5173 |
| ⚙️ API | http://localhost:8000 |
| 📈 MLflow | http://localhost:5000 |
| 🗄️ ChromaDB | http://localhost:8001 |

</div>

<br/>

## 🔑 Environment Variables

> ⚠️ Copy `.env.example` → `.env` and fill in your own values. **Never commit `.env`.**

| Variable | Purpose |
|:---|:---|
| `OPENAI_API_KEY` | Powers the LLM agents |
| `TAVILY_API_KEY` | Web search for market research |
| `DATABASE_URL` | Postgres connection |
| `REDIS_URL` | Session state store |
| `CHROMADB_HOST` | Vector store for RAG |
| `GITHUB_TOKEN` | GitHub automation |
| `NOTION_TOKEN` | Notion automation |
| `SLACK_WEBHOOK_URL` | Slack automation |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD` | Email automation |
| `MLFLOW_TRACKING_URI` | Experiment tracking |

<br/>

## 📡 API Reference

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/startup/generate` | Start a new session |
| `GET` | `/api/startup/{id}/status` | Poll agent progress |
| `WS` | `/ws/{id}` | Live agent event stream |
| `POST` | `/api/startup/{id}/upload-pdf` | Ingest a PDF into RAG |
| `GET` | `/api/startup/{id}/report` | Final compiled report |
| `GET` | `/api/startup/history` | List past sessions |
| `POST` | `/api/github` `/api/notion` `/api/email` `/api/slack` | Automations |

<br/>

## 🛣️ Status

<div align="center">

![Progress](https://img.shields.io/badge/pipeline_structure-done-brightgreen?style=for-the-badge)
![Progress](https://img.shields.io/badge/agent_logic-in_progress-yellow?style=for-the-badge)
![Progress](https://img.shields.io/badge/persistence-in_progress-yellow?style=for-the-badge)

</div>

Active scaffold — pipeline structure, API surface, and dashboard UI are in place; agent logic and persistence are being filled in incrementally. Contributions welcome!

<br/>

<div align="center">

**⭐ Star this repo if you find it useful!**

</div>
