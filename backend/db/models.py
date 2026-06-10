from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import JSONB, UUID

from db.database import Base


class StartupSession(Base):
    __tablename__ = "startup_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    idea = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    config = Column(JSONB, nullable=False)
    status = Column(String, nullable=False, default="running")
    final_report = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
