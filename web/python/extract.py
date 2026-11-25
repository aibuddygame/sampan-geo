import json
import time
from typing import Any

from bs4 import BeautifulSoup
import httpx
import trafilatura
from llm import VLLM_MODEL, llm_client
from helper import is_target_match, validate_public_http_url, strip_think_blocks

MAX_RAW_READ_CHARS = 30000  # Much higher read limit passed to the reader LLM
MAX_EXTRACTED_CHARS = 6000  # ~800 words hard cap returned to the main agent

READER_SYSTEM_PROMPT = """You are a precise web page extractor.
Given a page's text and a specific `topic`, extract ONLY the facts, explanations,
data points, quotes, and details from the page that are relevant to `topic`.

Rules:
- Rely ONLY on the provided page text. Do not invent or assume outside facts.
- Keep your response concise and under ~800 words.
- Use clear bullet points or short paragraphs.
- If the page contains nothing relevant to `topic`, say so clearly in one sentence."""


def run_extract_page(
    url: str, topic: str, target_domain: str | None
) -> tuple[str, dict[str, Any]]:
    start = time.perf_counter()
    matched = is_target_match(url, target_domain)
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
    }

    try:
        safe_url = validate_public_http_url(url)
        with httpx.Client(
            timeout=12.0, follow_redirects=True, headers=headers
        ) as client:
            resp = client.get(safe_url)
            status_code = resp.status_code
            resp.raise_for_status()
            html = resp.text

        extracted = trafilatura.extract(html, include_comments=False)
        title = ""
        soup = BeautifulSoup(html, "html.parser")
        if soup.title and soup.title.string:
            title = soup.title.string.strip()

        if not extracted:
            for tag in soup(["script", "style", "nav", "footer", "noscript", "aside"]):
                tag.decompose()
            extracted = "\n".join(
                line.strip()
                for line in soup.get_text("\n").splitlines()
                if line.strip()
            )

        full_text = extracted or ""
        reader_input = full_text[:MAX_RAW_READ_CHARS]

        if reader_input.strip():
            reader_resp = llm_client.chat.completions.create(
                model=VLLM_MODEL,
                temperature=0.1,
                messages=[
                    {"role": "system", "content": READER_SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": (
                            f"URL: {safe_url}\n"
                            f"Title: {title}\n"
                            f"Topic: {topic}\n\n"
                            f"Page Content:\n{reader_input}"
                        ),
                    },
                ],
            )
            focused_extract = strip_think_blocks(
                reader_resp.choices[0].message.content
            )[:MAX_EXTRACTED_CHARS]
        else:
            focused_extract = "No readable text could be extracted from this page."

        duration_ms = int((time.perf_counter() - start) * 1000)

        model_output = (
            f"URL: {safe_url}\n"
            f"Title: {title}\n"
            f"Topic: {topic}\n\n"
            f"{focused_extract}"
        )

        telemetry = {
            "url": url,
            "final_url": str(resp.url),
            "title": title,
            "topic": topic,
            "matches_target": matched,
            "status_code": status_code,
            "full_extracted_chars": len(full_text),
            "reader_input_chars": len(reader_input),
            "focused_output_chars": len(focused_extract),
            # Store a larger slice for debugging/GEO audit without bloating tiny previews
            "extracted_excerpt": full_text[:10000],
            "focused_extract": focused_extract,
            "duration_ms": duration_ms,
            "error": None,
        }
        return model_output, telemetry

    except Exception as exc:
        duration_ms = int((time.perf_counter() - start) * 1000)
        err_msg = f"{type(exc).__name__}: {exc}"
        telemetry = {
            "url": url,
            "final_url": None,
            "title": "",
            "topic": topic,
            "matches_target": matched,
            "status_code": None,
            "full_extracted_chars": 0,
            "reader_input_chars": 0,
            "focused_output_chars": 0,
            "extracted_excerpt": "",
            "focused_extract": "",
            "duration_ms": duration_ms,
            "error": err_msg,
        }
        return json.dumps({"url": url, "error": err_msg}), telemetry
