from __future__ import annotations

import json
import os
from typing import Any

import redis

from config import settings


REDIS_URL = os.getenv("REDIS_URL", settings.redis_url)
redis_client = redis.from_url(REDIS_URL, decode_responses=True)


def get_state(session_id: str) -> dict[str, Any]:
    raw_state = redis_client.get(f"session:{session_id}")
    return json.loads(raw_state) if raw_state else {}


def set_state(session_id: str, state: dict[str, Any]) -> bool:
    return bool(redis_client.set(f"session:{session_id}", json.dumps(state, default=str)))


def delete_state(session_id: str) -> bool:
    return bool(redis_client.delete(f"session:{session_id}"))
