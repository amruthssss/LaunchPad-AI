from __future__ import annotations

import json
import logging
import ssl

import httpx

from config import settings

logger = logging.getLogger(__name__)
_SYSTEM_SSL_CONTEXT = ssl.create_default_context()


def openrouter_market_research(
    idea: str,
    industry: str,
    audience: str,
    country: str,
    business_model: str,
) -> dict | None:
    """Return idea-specific AI research from OpenRouter, clearly marked uncited."""
    if not settings.openrouter_api_key:
        return None

    prompt = _market_research_prompt(idea, industry, audience, country, business_model)
    text = ""
    for reasoning_enabled in (True, False):
        try:
            response = httpx.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openrouter_api_key}",
                    "Content-Type": "application/json",
                    "X-Title": "LaunchPad AI",
                },
                json={
                    "model": settings.openrouter_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are a careful startup research assistant without live web search. "
                                "Return a valid JSON object only. Do not claim to have verified current facts; "
                                "do not invent sources, citations, numbers, or dates. Mark uncertain competitor fit, "
                                "market trends, and customer problems as hypotheses. If reliable market-size evidence "
                                "is unavailable, say so."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "reasoning": {"enabled": reasoning_enabled},
                    "temperature": 0.2,
                },
                timeout=90,
                verify=_SYSTEM_SSL_CONTEXT,
            )
            response.raise_for_status()
            payload = response.json()
            text = _completion_text(payload)
            if text:
                break

            # Some reasoning-capable provider responses contain no user-facing
            # completion. Retry once with reasoning disabled before falling back.
            logger.warning(
                "OpenRouter returned no completion text (reasoning_enabled=%s, finish_reason=%s); retrying",
                reasoning_enabled,
                _finish_reason(payload),
            )
        except httpx.HTTPStatusError as exc:
            logger.warning("OpenRouter market research returned HTTP %s", exc.response.status_code)
            return _unavailable(
                f"OpenRouter returned HTTP {exc.response.status_code}; check the API key, free-model limits, and provider availability."
            )
        except (httpx.HTTPError, ValueError, TypeError) as exc:
            logger.warning("OpenRouter market research failed (%s)", type(exc).__name__)
            return _unavailable(f"OpenRouter request failed ({type(exc).__name__}).")

    if not text:
        return _unavailable(
            "OpenRouter returned no answer after retrying without reasoning. Try again later; showing industry heuristics."
        )

    result = _parse_json_object(text)
    return {
        "research_brief": str(result.get("research_brief") or text),
        "market_size": str(result.get("market_size") or "No reliable market-size estimate was returned."),
        "competitors": _string_list(result.get("competitors")),
        "trends": _string_list(result.get("trends")),
        "customer_problems": _string_list(result.get("customer_problems")),
        "sources": [],
        "search_queries": [],
        "research_status": "ungrounded",
        "research_provider": "OpenRouter · NVIDIA Nemotron",
        "research_error": (
            "This OpenRouter answer is AI-generated without live web citations. "
            "OpenRouter's free NVIDIA endpoint says request data may be logged and used to improve its products; "
            "avoid submitting confidential or personal information. Verify all generated claims."
        ),
    }


def _unavailable(message: str) -> dict:
    return {
        "research_status": "unavailable",
        "research_provider": "OpenRouter · NVIDIA Nemotron",
        "research_error": message,
    }


def _completion_text(payload: dict) -> str:
    choices = payload.get("choices") or []
    message = (choices[0].get("message") or {}) if choices else {}
    content = message.get("content")
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        return "\n".join(
            part["text"].strip()
            for part in content
            if isinstance(part, dict) and isinstance(part.get("text"), str) and part["text"].strip()
        )
    return ""


def _finish_reason(payload: dict) -> str:
    choices = payload.get("choices") or []
    return str(choices[0].get("finish_reason") or "unknown") if choices else "no_choices"


def _market_research_prompt(idea: str, industry: str, audience: str, country: str, business_model: str) -> str:
    return f"""Analyze this startup idea. This request has no live web search or citations.

Startup idea: {idea}
Industry: {industry}
Target audience: {audience or 'not specified'}
Country or region: {country or 'not specified'}
Business model: {business_model}

Return one JSON object with these keys:
{{"research_brief":"2-4 concise sentences tailored to this idea, distinguishing known general context from hypotheses","market_size":"Say that no verified estimate is available; do not invent a number","competitors":["3-6 likely direct or adjacent alternatives; label uncertain matches as hypotheses"],"trends":["3 relevant trends framed as hypotheses unless they are stable general knowledge"],"customer_problems":["3 specific customer pain hypotheses to validate"]}}

Do not invent citations, sources, current statistics, dates, or claims that you searched the web. If unsure whether a company is a competitor or a trend is current, say so. Keep output specific to the idea and return valid JSON only."""


def _parse_json_object(text: str) -> dict:
    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        try:
            result = json.loads(text[start : end + 1]) if start >= 0 and end > start else {}
        except json.JSONDecodeError:
            result = {}
    return result if isinstance(result, dict) else {}


def _string_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]
