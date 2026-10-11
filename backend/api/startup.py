from __future__ import annotations

import os
import tempfile
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import StartupSession
from memory.redis_client import get_state, set_state
from models.schemas import StartupGenerateRequest, StartupHistoryItem, StartupSessionResponse, StartupStatusResponse
from models.state import AgentState
from rag.rag_pipeline import ingest_pdf


router = APIRouter(prefix="/startup", tags=["startup"])


def _extract_outputs(state: AgentState) -> dict:
    return {
        "market_research": state.get("market_research", {}),
        "business_plan": state.get("business_plan", {}),
        "tech_architecture": state.get("tech_architecture", {}),
        "generated_code": state.get("generated_code", {}),
        "forecast": state.get("forecast", {}),
        "deployment_config": state.get("deployment_config", {}),
        "critic_scores": state.get("critic_scores", {}),
        "retry_flags": state.get("retry_flags", {}),
        "retry_counts": state.get("retry_counts", {}),
    }


@router.post("/generate", response_model=StartupSessionResponse)
async def generate_startup(request: StartupGenerateRequest, db: Session = Depends(get_db)) -> StartupSessionResponse:
    session_id = str(uuid4())
    initial_state: AgentState = {
        "idea": request.idea,
        "industry": request.industry,
        "target_audience": request.target_audience,
        "country": request.country,
        "business_model": request.business_model,
        "session_id": session_id,
        "market_research": {},
        "business_plan": {},
        "tech_architecture": {},
        "generated_code": {},
        "forecast": {},
        "deployment_config": {},
        "critic_scores": {},
        "retry_flags": {},
        "retry_counts": {},
        "step_status": {"startup": "running"},
    }

    db.add(
        StartupSession(
            id=UUID(session_id),
            idea=request.idea,
            industry=request.industry,
            config=request.model_dump(),
            status="running",
            final_report=None,
        )
    )
    db.commit()
    set_state(session_id, initial_state)
    return StartupSessionResponse(session_id=session_id)


@router.get("/{session_id}/status", response_model=StartupStatusResponse)
async def get_status(session_id: str, db: Session = Depends(get_db)) -> StartupStatusResponse:
    state = get_state(session_id)
    if not state:
        try:
            row = db.query(StartupSession).filter(StartupSession.id == UUID(session_id)).one_or_none()
        except ValueError:
            row = None
        state = row.final_report if row and row.final_report else ({**row.config, "session_id": session_id, "step_status": {}} if row else None)
        if not state:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        set_state(session_id, state)
    return StartupStatusResponse(
        session_id=session_id,
        idea=state.get("idea", ""),
        step_status=state.get("step_status", {}),
        outputs=_extract_outputs(state),
    )


@router.post("/{session_id}/upload-pdf")
async def upload_pdf(session_id: str, file: UploadFile = File(...)) -> dict:
    if not get_state(session_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if file.content_type not in {"application/pdf", "application/x-pdf"} and not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="PDF files only")

    content = await file.read(15 * 1024 * 1024 + 1)
    if len(content) > 15 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="PDF must be smaller than 15 MB")
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(content)
        temp_path = temp_file.name

    try:
        try:
            result = ingest_pdf(temp_path, session_id)
        except (ValueError, RuntimeError) as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
    return {"message": "PDF ingested successfully", **result}


@router.get("/{session_id}/report")
async def get_report(session_id: str, db: Session = Depends(get_db)) -> dict:
    state = get_state(session_id)
    try:
        session_row = db.query(StartupSession).filter(StartupSession.id == UUID(session_id)).one_or_none()
    except ValueError:
        session_row = None
    if session_row and session_row.final_report:
        return session_row.final_report
    if state:
        return state
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")


@router.get("/history", response_model=list[StartupHistoryItem])
async def history(db: Session = Depends(get_db)) -> list[StartupHistoryItem]:
    sessions = db.query(StartupSession).order_by(StartupSession.created_at.desc()).all()
    return [
        StartupHistoryItem(
            id=str(session.id),
            idea=session.idea,
            status=session.status,
            created_at=session.created_at,
        )
        for session in sessions
    ]
