from __future__ import annotations

from openai import OpenAI

from config import settings


def optional_completion(system_prompt: str, user_prompt: str) -> str | None:
    """Best-effort OpenAI enrichment; the local heuristic workflow never depends on a key."""
    if not settings.openai_api_key:
        return None
    try:
        result = OpenAI(api_key=settings.openai_api_key).chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.3,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
        )
        return result.choices[0].message.content
    except Exception:
        return None
