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


app = FastAPI(title=settings.app_name, version="1.0.0", description="Plan and validate startup ideas with a live agent workflow.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
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
    return {"status": "LaunchPad AI API is running"}


@app.websocket("/ws/{session_id}")
async def websocket_status(websocket: WebSocket, session_id: str) -> None:
    await websocket.accept()
    session_state = get_state(session_id)
    if not session_state:
        from db.database import SessionLocal
        from db.models import StartupSession
        from uuid import UUID
        try:
            with SessionLocal() as db:
                row = db.query(StartupSession).filter(StartupSession.id == UUID(session_id)).one_or_none()
                session_state = row.final_report if row and row.final_report else ({**row.config, "session_id": session_id, "step_status": {}} if row else {})
        except ValueError:
            session_state = {}
        if not session_state:
            await websocket.send_json({"step": "websocket", "status": "failed", "output": {"detail": "Session not found"}})
            await websocket.close()
            return

    if session_state.get("step_status", {}).get("workflow") in {"completed", "failed"}:
        status_value = session_state["step_status"]["workflow"]
        await websocket.send_json({"step": "workflow", "status": status_value, "output": {"message": "Your launch plan is ready." if status_value == "completed" else session_state.get("error", "The workflow failed.")}})
        await websocket.close()
        return

    async def _stream() -> None:
        try:
            async for event_json in run_workflow(session_state.get("idea", ""), session_state):
                await websocket.send_text(event_json)
            final_state = get_state(session_id) or session_state
            final_state.setdefault("step_status", {})["workflow"] = "completed"
            from memory.redis_client import set_state
            set_state(session_id, final_state)
            from db.database import SessionLocal
            with SessionLocal() as db:
                from db.models import StartupSession
                from uuid import UUID
                row = db.query(StartupSession).filter(StartupSession.id == UUID(session_id)).one_or_none()
                if row:
                    row.status = "completed"
                    row.final_report = final_state
                    db.commit()
            await websocket.send_json({"step": "workflow", "status": "completed", "output": {"message": "Your launch plan is ready."}})
        except WebSocketDisconnect:
            raise
        except Exception as exc:
            from memory.redis_client import set_state
            failed_state = get_state(session_id) or session_state
            failed_state.setdefault("step_status", {})["workflow"] = "failed"
            failed_state["error"] = str(exc)
            set_state(session_id, failed_state)
            from db.database import SessionLocal
            from db.models import StartupSession
            from uuid import UUID
            with SessionLocal() as db:
                row = db.query(StartupSession).filter(StartupSession.id == UUID(session_id)).one_or_none()
                if row:
                    row.status = "failed"
                    row.final_report = failed_state
                    db.commit()
            await websocket.send_json({"step": "workflow", "status": "failed", "output": {"message": "The workflow stopped unexpectedly.", "detail": str(exc)}})

    workflow_task = asyncio.create_task(_stream())
    try:
        await workflow_task
    except WebSocketDisconnect:
        workflow_task.cancel()
    finally:
        if websocket.client_state.name != "DISCONNECTED":
            await websocket.close()
