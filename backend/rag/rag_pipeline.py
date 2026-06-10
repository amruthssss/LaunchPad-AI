from __future__ import annotations

from pathlib import Path
from typing import Any

from chromadb import HttpClient

from config import settings


def build_rag_pipeline() -> HttpClient:
    return HttpClient(host=settings.chromadb_host, port=8000)


def query_knowledge(query: str, top_k: int = 3) -> list[str]:
    client = build_rag_pipeline()
    _ = client
    return [
        f"Knowledge chunk 1 for: {query}",
        f"Knowledge chunk 2 for: {query}",
        f"Knowledge chunk 3 for: {query}",
    ][:top_k]


def load_default_knowledge() -> list[dict[str, Any]]:
    # Placeholder knowledge bootstrap for the default RAG corpus.
    return [
        {"title": "Startup validation basics", "content": "Research, plan, prototype, validate, iterate."},
        {"title": "AI product design", "content": "Use narrow workflows and feedback loops."},
    ]


def ingest_pdf(file_path: str, session_id: str) -> dict[str, Any]:
    # Placeholder PDF ingestion flow; replace with parsing, chunking, and vector indexing.
    file_name = Path(file_path).name
    return {"session_id": session_id, "file_name": file_name, "status": "ingested"}
