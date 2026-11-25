import json
import time
from typing import Any
from ddgs import DDGS
from helper import is_target_match

MAX_TOOL_TEXT_CHARS = 5000

def run_web_search(
    query: str, max_results: int, target_domain: str | None
) -> tuple[str, dict[str, Any]]:
    start = time.perf_counter()
    try:
        raw_results = DDGS().text(query, max_results=max_results) or []
        enriched = []
        for idx, item in enumerate(raw_results, start=1):
            href = item.get("href", "")
            enriched.append(
                {
                    "rank": idx,
                    "title": item.get("title", ""),
                    "href": href,
                    "body": item.get("body", ""),
                    "matches_target": is_target_match(href, target_domain),
                }
            )
        duration_ms = int((time.perf_counter() - start) * 1000)

        llm_payload = [
            {
                "rank": r["rank"],
                "title": r["title"],
                "url": r["href"],
                "snippet": r["body"],
            }
            for r in enriched
        ]
        model_output = json.dumps(llm_payload, ensure_ascii=False)[:MAX_TOOL_TEXT_CHARS]

        telemetry = {
            "query": query,
            "result_count": len(enriched),
            "target_hit_count": sum(1 for r in enriched if r["matches_target"]),
            "results": enriched,
            "duration_ms": duration_ms,
            "error": None,
        }
        return model_output, telemetry

    except Exception as exc:
        duration_ms = int((time.perf_counter() - start) * 1000)
        err_msg = f"{type(exc).__name__}: {exc}"
        telemetry = {
            "query": query,
            "result_count": 0,
            "target_hit_count": 0,
            "results": [],
            "duration_ms": duration_ms,
            "error": err_msg,
        }
        return json.dumps({"error": err_msg}), telemetry