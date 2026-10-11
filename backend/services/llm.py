from __future__ import annotations

import json
import logging

import httpx
from openai import OpenAI

from config import settings

logger = logging.getLogger(__name__)

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
        return None

    prompt = f"""Research this startup idea using Google Search grounding. Search for current, specific evidence; do not reuse generic industry boilerplate.

Startup idea: {idea}
Industry: {industry}
Target audience: {audience or 'not specified'}
Country or region: {country or 'not specified; use globally relevant evidence'}
Business model: {business_model}

Return only one valid JSON object with these keys:
{{"research_brief":"2-4 evidence-based sentences tailored to this idea","market_size":"A sourced market-size estimate if credible evidence is available, with geography, date and definition; otherwise say evidence was not found","competitors":["3-6 real direct or adjacent competitors, with a concise differentiator after an em dash"],"trends":["3 current, specific trends relevant to this idea"],"customer_problems":["3 specific pains supported by market evidence or clearly marked as hypotheses"]}}

Rules: distinguish direct competitors from substitutes; prioritize recent, relevant sources and the specified geography; do not invent figures, companies, citations, or dates; say when reliable evidence is unavailable. The UI will show citations from your grounded web results separately."""
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
        )
        search_unavailable_note = ""
        if response.status_code == 429:
            # Some API projects can call Gemini but do not have Search grounding
            # quota. Retry for a tailored AI response, while making its lack of
            # web verification explicit to the user.
            logger.warning("Gemini Search grounding returned HTTP 429; retrying without Search")
            response = httpx.post(
                endpoint,
                headers={"x-goog-api-key": settings.gemini_api_key},
                json=request,
                timeout=60,
            )
            search_unavailable_note = "Google Search grounding was rate-limited; this Gemini response has no verified web citations."
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
        try:
            result = json.loads(text)
        except json.JSONDecodeError:
            # The generateContent + Search endpoint can return fenced JSON or prose.
            # Parse an embedded object when possible; preserve grounded prose otherwise.
            start, end = text.find("{"), text.rfind("}")
            try:
                result = json.loads(text[start : end + 1]) if start >= 0 and end > start else {"research_brief": text}
            except json.JSONDecodeError:
                result = {"research_brief": text}
        if not isinstance(result, dict):
            result = {"research_brief": text}

        return {
            "research_brief": str(result.get("research_brief", text)),
            "market_size": str(result.get("market_size", "No sourced market-size estimate was returned.")),
            "competitors": _string_list(result.get("competitors")),
            "trends": _string_list(result.get("trends")),
            "customer_problems": _string_list(result.get("customer_problems")),
            "sources": sources,
            "search_queries": list(dict.fromkeys(search_queries)),
            "research_status": "grounded" if sources else "ungrounded",
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
            message = "Gemini quota/rate limit reached, or this model is unavailable for the API project's current tier. Check Google AI Studio usage limits."
        elif status_code == 404:
            message = f"Gemini could not find the configured model or API endpoint. Model: {settings.gemini_model}. {provider_message}".strip()
        elif status_code in {401, 403}:
            message = f"Gemini rejected the API key or its permissions (HTTP {status_code}). {provider_message}".strip()
        else:
            message = f"Gemini returned HTTP {status_code}. {provider_message or 'Check the Gemini API configuration.'}".strip()
        return {"research_status": "unavailable", "research_error": message}
    except httpx.HTTPError as exc:
        logger.warning("Gemini market research request failed (%s)", type(exc).__name__)
        return {"research_status": "unavailable", "research_error": f"Gemini request failed ({type(exc).__name__})."}
    except (ValueError, KeyError, IndexError, TypeError) as exc:
        logger.warning("Gemini market research response could not be parsed (%s)", type(exc).__name__)
        return {"research_status": "unavailable", "research_error": "Gemini returned an invalid response."}


def _string_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]
