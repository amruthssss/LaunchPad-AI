from __future__ import annotations

import json

import httpx
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
    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.gemini_model}:generateContent"
    )
    try:
        response = httpx.post(
            endpoint,
            headers={"x-goog-api-key": settings.gemini_api_key},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "tools": [{"google_search": {}}],
                # Do not request JSON MIME mode on this endpoint: it can conflict with
                # Google Search grounding and suppress the citation metadata we need.
                "generationConfig": {"temperature": 0.2},
            },
            timeout=60,
        )
        response.raise_for_status()
        payload = response.json()
        candidate = (payload.get("candidates") or [{}])[0]
        parts = candidate.get("content", {}).get("parts", [])
        text = "\n".join(part.get("text", "") for part in parts if part.get("text"))
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

        metadata = candidate.get("groundingMetadata", {})
        sources = []
        seen_urls = set()
        for chunk in metadata.get("groundingChunks", []):
            web = chunk.get("web", {})
            url = web.get("uri")
            if url and url not in seen_urls:
                seen_urls.add(url)
                sources.append({"title": web.get("title") or url, "url": url})
        return {
            "research_brief": str(result.get("research_brief", text)),
            "market_size": str(result.get("market_size", "No sourced market-size estimate was returned.")),
            "competitors": _string_list(result.get("competitors")),
            "trends": _string_list(result.get("trends")),
            "customer_problems": _string_list(result.get("customer_problems")),
            "sources": sources,
            "search_queries": _string_list(metadata.get("webSearchQueries")),
            "research_status": "grounded" if sources else "ungrounded",
        }
    except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError):
        # Never surface request details; HTTP client errors can include sensitive headers.
        return None


def _string_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]
