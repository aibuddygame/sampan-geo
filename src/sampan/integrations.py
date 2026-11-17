"""Local connection diagnostics. Never expose credentials or provider response bodies."""
from datetime import datetime, timezone
import asyncio
import json

import httpx

from sampan.kimi import MAX_CALLS


async def check_kimi(analyzer):
    result = {"checked_at": datetime.now(timezone.utc).isoformat(), "status": "not_configured"}
    if not analyzer.configured:
        return result
    try:
        async with asyncio.timeout(20):
            async with httpx.AsyncClient(timeout=15, follow_redirects=False, trust_env=False,
                                         transport=analyzer._transport) as client:
                async with client.stream("GET", "https://api.moonshot.ai/v1/models",
                                         headers={"Authorization": "Bearer " + analyzer._key}) as response:
                    if response.status_code != 200:
                        result["status"] = "authentication_failed" if response.status_code in (401, 403) else "provider_unavailable"
                        return result
                    body = bytearray()
                    async for chunk in response.aiter_bytes():
                        body.extend(chunk)
                        if len(body) > 128_000:
                            result["status"] = "invalid_response"
                            return result
                    data = json.loads(body)
                    models = data.get("data", [])
                    if not isinstance(models, list):
                        raise ValueError("Invalid model list")
                    result["status"] = "verified" if any(isinstance(m, dict) and m.get("id") == analyzer.model for m in models) else "model_unavailable"
    except (httpx.HTTPError, TimeoutError, ValueError, AttributeError, TypeError):
        result["status"] = "connection_failed"
    return result


def integration_status(analyzer, connection, renderer_installed):
    return {
        "hosting": "localhost_only",
        "kimi": {
            "configured": analyzer.configured, "model": analyzer.model,
            "connection": connection,
            "completion_attempts": analyzer.calls,
            "completion_budget": MAX_CALLS,
            "last_analysis": {key: analyzer.records[-1].get(key) for key in
                              ("status", "model", "prompt_tokens", "completion_tokens", "reasoning_tokens", "estimated_cost_usd", "cost_status")}
                             if analyzer.records else None,
        },
        "renderer": {"installed": renderer_installed, "browser_verified": "per_scan"},
        "search_console": {"status": "not_connected", "connector_ready": True,
                           "reason": "Local read-only CLI prepared; OAuth client, consent and actual property/data verification still required. See docs29."},
        "search_positions": {"status": "not_connected"},
        "ai_citations": {"status": "not_measured", "reason": "Kimi keyword analysis has no web search and is not an independent citation benchmark."},
    }
