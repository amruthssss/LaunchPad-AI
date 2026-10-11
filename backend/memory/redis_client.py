from __future__ import annotations

import json
import os
from typing import Any

import redis

from config import settings


REDIS_URL = os.getenv("REDIS_URL", settings.redis_url).strip()
_memory: dict[str, str] = {}


class OptionalRedis:
    """Use Redis when configured and reachable; otherwise keep local sessions in memory."""
    def __init__(self):
        self.client = redis.from_url(REDIS_URL, decode_responses=True) if REDIS_URL else None

    def ping(self):
        if self.client:
            try:
                return self.client.ping()
            except redis.RedisError:
                return False
        return True

    def get(self, key):
        if self.client:
            try:
                return self.client.get(key)
            except redis.RedisError:
                pass
        return _memory.get(key)

    def set(self, key, value):
        if self.client:
            try:
                return self.client.set(key, value, ex=60 * 60 * 24 * 7)
            except redis.RedisError:
                pass
        _memory[key] = value
        return True

    def delete(self, key):
        if self.client:
            try:
                self.client.delete(key)
            except redis.RedisError:
                pass
        return _memory.pop(key, None) is not None


redis_client = OptionalRedis()


def get_state(session_id: str) -> dict[str, Any]:
    raw_state = redis_client.get(f"session:{session_id}")
    return json.loads(raw_state) if raw_state else {}


def set_state(session_id: str, state: dict[str, Any]) -> bool:
    return bool(redis_client.set(f"session:{session_id}", json.dumps(state, default=str)))


def delete_state(session_id: str) -> bool:
    return bool(redis_client.delete(f"session:{session_id}"))
