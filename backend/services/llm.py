from __future__ import annotations

import json
import logging
import ssl

import httpx
from openai import OpenAI

from config import settings

logger = logging.getLogger(__name__)
_SYSTEM_SSL_CONTEXT = ssl.create_default_context()

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


def grounded_market_research(
    idea: str,
    industry: str,
    audience: str,
    country: str,
    business_model: str,
) -> dict | None:
    """Return idea-specific market research grounded in live Google Search results."""
    if not settings.gemini_api_key:
        return _openrouter_market_research(
            _market_research_prompt(idea, industry, audience, country, business_model),
            "Gemini is not configured. This OpenRouter answer is AI-generated without live web citations.",
        )

    prompt = _market_research_prompt(idea, industry, audience, country, business_model)
    # Gemini's Interactions API exposes Search steps and citations directly.
    endpoint = "https://generativelanguage.googleapis.com/v1beta/interactions"
    try:
        request = {
            "model": settings.gemini_model,
            "input": prompt,
            "response_format": {
                "type": "text",
                "mime_type": "application/json",
                "schema": {
                    "type": "object",
                    "properties": {
                        "research_brief": {"type": "string"},
                        "market_size": {"type": "string"},
                        "competitors": {"type": "array", "items": {"type": "string"}},
                        "trends": {"type": "array", "items": {"type": "string"}},
                        "customer_problems": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": [
                        "research_brief", "market_size", "competitors", "trends", "customer_problems"
                    ],
                },
            },
            # Startup ideas can be private. Keep requests out of server-side history.
            "store": False,
        }
        response = httpx.post(
            endpoint,
            headers={"x-goog-api-key": settings.gemini_api_key},
            json={**request, "tools": [{"type": "google_search"}]},
            timeout=60,
            verify=_SYSTEM_SSL_CONTEXT,
        )
        search_unavailable_note = ""
        if response.status_code in {429, 503}:
            # Some API projects can call Gemini but do not have Search grounding
            # quota, and Search can be temporarily overloaded. Retry for a
            # tailored AI response, while making its lack of web verification
            # explicit to the user.
            logger.warning(
                "Gemini Search grounding returned HTTP %s; retrying without Search",
                response.status_code,
            )
            search_status = response.status_code
            response = httpx.post(
                endpoint,
                headers={"x-goog-api-key": settings.gemini_api_key},
                json=request,
                timeout=60,
                verify=_SYSTEM_SSL_CONTEXT,
            )
            search_unavailable_note = (
                f"Google Search grounding was unavailable (HTTP {search_status}); "
                "this Gemini response has no verified web citations."
            )
        response.raise_for_status()
        payload = response.json()
        text_parts = []
        sources = []
        seen_urls = set()
        search_queries = []
        for step in payload.get("steps", []):
            if step.get("type") == "google_search_call":
                search_queries.extend(_string_list(step.get("arguments", {}).get("queries")))
            if step.get("type") != "model_output":
                continue
            for block in step.get("content", []):
                if block.get("type") == "text" and block.get("text"):
                    text_parts.append(block["text"])
                for annotation in block.get("annotations", []):
                    url = annotation.get("uri") or annotation.get("url")
                    if url and url not in seen_urls:
                        seen_urls.add(url)
                        sources.append({"title": annotation.get("title") or url, "url": url})
        text = "\n".join(text_parts)
        if not text:
            return None
        result = _parse_json_object(text)
        return {
            "research_brief": str(result.get("research_brief", text)),
            "market_size": str(result.get("market_size", "No sourced market-size estimate was returned.")),
            "competitors": _string_list(result.get("competitors")),
            "trends": _string_list(result.get("trends")),
            "customer_problems": _string_list(result.get("customer_problems")),
            "sources": sources,
            "search_queries": list(dict.fromkeys(search_queries)),
            "research_status": "grounded" if sources else "ungrounded",
            "research_provider": "Gemini",
            "research_error": search_unavailable_note,
        }
    except httpx.HTTPStatusError as exc:
        status_code = exc.response.status_code
        try:
            error_body = exc.response.json().get("error", {})
        except (ValueError, AttributeError):
            error_body = {}
        error_code = str(error_body.get("status") or error_body.get("code") or "")
        provider_message = str(error_body.get("message") or "").strip()
        logger.warning(
            "Gemini market research returned HTTP %s (%s): %s",
            status_code,
            error_code or "no provider code",
            provider_message[:500] or "no provider message",
        )
        if status_code == 429:
            message = "Gemini quota/rate limit reached."
        elif status_code == 404:
            message = f"Gemini could not find model {settings.gemini_model}. {provider_message}".strip()
        elif status_code in {401, 403}:
            message = f"Gemini rejected the API key or its permissions (HTTP {status_code}). {provider_message}".strip()
        else:
            message = f"Gemini returned HTTP {status_code}. {provider_message or 'Check the Gemini API configuration.'}".strip()
        return _openrouter_market_research(prompt, f"{message} OpenRouter fallback has no live web citations.") or {
            "research_status": "unavailable", "research_error": message,
        }
    except httpx.HTTPError as exc:
        logger.warning("Gemini market research request failed (%s)", type(exc).__name__)
        message = f"Gemini request failed ({type(exc).__name__})."
        return _openrouter_market_research(prompt, f"{message} OpenRouter fallback has no live web citations.") or {
            "research_status": "unavailable", "research_error": message,
        }
    except (ValueError, KeyError, IndexError, TypeError) as exc:
        logger.warning("Gemini market research response could not be parsed (%s)", type(exc).__name__)
        message = "Gemini returned an invalid response."
        return _openrouter_market_research(prompt, f"{message} OpenRouter fallback has no live web citations.") or {
            "research_status": "unavailable", "research_error": message,
        }


def _market_research_prompt(idea: str, industry: str, audience: str, country: str, business_model: str) -> str:
    return f"""Research this startup idea with current, specific evidence when web search is available; do not reuse generic industry boilerplate.

Startup idea: {idea}
Industry: {industry}
Target audience: {audience or 'not specified'}
Country or region: {country or 'not specified; use globally relevant evidence'}
Business model: {business_model}

Return one JSON object with these keys:
{{"research_brief":"2-4 evidence-based sentences tailored to this idea","market_size":"A sourced market-size estimate if credible evidence is available, with geography, date and definition; otherwise say evidence was not found","competitors":["3-6 real direct or adjacent competitors, with a concise differentiator after an em dash"],"trends":["3 current, specific trends relevant to this idea"],"customer_problems":["3 specific pains supported by market evidence or clearly marked as hypotheses"]}}

Rules: distinguish direct competitors from substitutes; prioritize recent, relevant sources and the specified geography; do not invent figures, companies, citations, or dates; say when reliable evidence is unavailable. The UI will show verified web citations separately."""


def _openrouter_market_research(prompt: str, reason: str) -> dict | None:
    """Use OpenRouter as an explicitly uncited fallback when configured."""
    if not settings.openrouter_api_key:
        return None
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
                    {"role": "system", "content": "You are a careful startup market research assistant. Return a valid JSON object only. Never fabricate statistics, sources, or market facts; mark uncertain information as a hypothesis."},
                    {"role": "user", "content": prompt},
                ],
                "reasoning": {"enabled": True},
                "temperature": 0.2,
            },
            timeout=90,
            verify=_SYSTEM_SSL_CONTEXT,
        )
        response.raise_for_status()
        payload = response.json()
        text = payload["choices"][0]["message"].get("content") or ""
        if not text:
            return None
        result = _parse_json_object(text)
        return {
            "research_brief": str(result.get("research_brief", text)),
            "market_size": str(result.get("market_size", "No reliable market-size estimate was returned.")),
            "competitors": _string_list(result.get("competitors")),
            "trends": _string_list(result.get("trends")),
            "customer_problems": _string_list(result.get("customer_problems")),
            "sources": [],
            "search_queries": [],
            "research_status": "ungrounded",
            "research_provider": "OpenRouter · NVIDIA Nemotron",
            "research_error": (
                f"{reason} OpenRouter's free NVIDIA endpoint says request data may be logged and used to improve its products; "
                "avoid submitting confidential or personal information. Verify all generated claims."
            ),
        }
    except httpx.HTTPStatusError as exc:
        logger.warning("OpenRouter market research returned HTTP %s", exc.response.status_code)
        return {
            "research_status": "unavailable",
            "research_provider": "OpenRouter · NVIDIA Nemotron",
            "research_error": f"OpenRouter returned HTTP {exc.response.status_code}; check the API key, free-model limits, and provider availability.",
        }
    except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError) as exc:
        logger.warning("OpenRouter market research failed (%s)", type(exc).__name__)
        return {
            "research_status": "unavailable",
            "research_provider": "OpenRouter · NVIDIA Nemotron",
            "research_error": f"OpenRouter request failed ({type(exc).__name__}).",
        }


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
