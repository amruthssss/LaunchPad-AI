from __future__ import annotations

from pathlib import Path
from typing import Any

_documents: dict[str, list[str]] = {}


def query_knowledge(query: str, top_k: int = 3, session_id: str = "") -> list[str]:
    corpus = [
        "Validate a painful customer problem with interviews before building a broad product.",
        "Start with a narrow ideal customer profile, a clear value proposition, and one measurable acquisition channel.",
        "Price against customer value, test willingness to pay, and track retention alongside acquisition.",
        "For AI products, define human review, data retention, privacy, and fallback behavior from the start.",
        "A strong MVP tests the riskiest business assumption with the smallest usable feature set.",
    ] + _documents.get("shared", []) + _documents.get(session_id, [])
    words = set(query.lower().split())
    ranked = sorted(corpus, key=lambda item: len(words.intersection(item.lower().split())), reverse=True)
    ranked = [item for item in ranked if words.intersection(item.lower().split())]
    return (ranked or corpus)[:top_k]


def load_default_knowledge() -> list[dict[str, Any]]:
    # Placeholder knowledge bootstrap for the default RAG corpus.
    return [
        {"title": "Startup validation basics", "content": "Research, plan, prototype, validate, iterate."},
        {"title": "AI product design", "content": "Use narrow workflows and feedback loops."},
    ]


def ingest_pdf(file_path: str, session_id: str) -> dict[str, Any]:
    file_name = Path(file_path).name
    try:
        from pypdf import PdfReader
        text = "\n".join(page.extract_text() or "" for page in PdfReader(file_path).pages)
    except ImportError as exc:
        raise RuntimeError("PDF support is unavailable. Install pypdf to ingest documents.") from exc
    chunks = [text[index:index + 900].strip() for index in range(0, len(text), 800)]
    _documents[session_id] = [chunk for chunk in chunks if chunk]
    if not _documents[session_id]:
        raise ValueError("No readable text was found in this PDF.")
    return {"session_id": session_id, "file_name": file_name, "status": "ingested", "chunks": len(_documents[session_id])}
