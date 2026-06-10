from __future__ import annotations

import asyncio

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from api.automation import router as automation_router
from api.startup import router as startup_router
from db.database import Base, engine
from config import settings
from graph.workflow import run_workflow
from memory.redis_client import get_state, redis_client
from rag.rag_pipeline import load_default_knowledge


app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(startup_router, prefix="/api")
app.include_router(automation_router, prefix="/api")


@app.on_event("startup")
async def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    load_default_knowledge()
    redis_client.ping()


@app.get("/")
async def root() -> dict[str, str]:
    return {"status": "AI Startup Factory API running"}


@app.websocket("/ws/{session_id}")
async def websocket_status(websocket: WebSocket, session_id: str) -> None:
    await websocket.accept()
    session_state = get_state(session_id)
    if not session_state:
        await websocket.send_json({"step": "websocket", "status": "failed", "output": {"detail": "Session not found"}})
        await websocket.close()
        return

    async def _stream() -> None:
        async for event_json in run_workflow(session_state.get("idea", ""), session_state):
            await websocket.send_text(event_json)

    workflow_task = asyncio.create_task(_stream())
    try:
        await workflow_task
    except WebSocketDisconnect:
        workflow_task.cancel()
    finally:
        if not websocket.client_state.name == "DISCONNECTED":
            await websocket.close()
