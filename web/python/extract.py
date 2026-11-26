import json
import re
import time
from typing import Any
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup
import httpx
import trafilatura
from helper import is_target_match, strip_think_blocks, validate_public_http_url
from llm import VLLM_MODEL, llm_client

MAX_HTML_BYTES = 2_000_000  # ~2 MB cap so huge pages don't slow down retrieval
MAX_RAW_READ_CHARS = 30_000  # Bounded text sent to the reader sub-agent
MAX_EXTRACTED_CHARS = 6_000  # ~800 words returned to the parent search agent

READER_SYSTEM_PROMPT = """You are a search and retrieval web-reading sub-agent.
Given page content and a `topic`, extract ONLY accurate facts, claims, figures,
quotes, and details relevant to `topic` to help a parent agent answer a query.

Rules:
- Rely ONLY on the provided page content. Do not invent facts or URLs.
- Keep your response concise and under ~800 words.
- Use clear bullet points or short paragraphs.
- Include a "Relevant Links" section at the end ONLY if the page content has links relevant to `topic` or helpful follow-up pages.
- Every link in "Relevant Links" MUST be a full http:// or https:// URL taken verbatim from the page content (never relative paths like /docs or #anchors).
- If the page contains nothing relevant to `topic`, state that clearly in one sentence."""

_MD_LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
_TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)


def _absolutize_links(markdown_text: str, base_url: str) -> str:
    def _replace(match: re.Match[str]) -> str:
        label = match.group(1).strip()
        raw_href = match.group(2).strip()
        if (
            not raw_href
            or raw_href.startswith("#")
            or raw_href.lower().startswith(("mailto:", "tel:", "javascript:"))
        ):
            return label
        resolved = urljoin(base_url, raw_href)
        parsed = urlparse(resolved)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            return label
        return f"[{label}]({resolved})"

    return _MD_LINK_RE.sub(_replace, markdown_text)


def _fetch_html_capped(
    url: str, headers: dict[str, str], max_bytes: int
) -> tuple[str, str, int]:
    chunks: list[bytes] = []
    total_bytes = 0
    with httpx.Client(timeout=10.0, follow_redirects=True, headers=headers) as client:
        with client.stream("GET", url) as resp:
            status_code = resp.status_code
            resp.raise_for_status()
            for chunk in resp.iter_bytes(chunk_size=65536):
                if not chunk:
                    continue
                remaining = max_bytes - total_bytes
                if remaining <= 0:
                    break
                if len(chunk) > remaining:
                    chunks.append(chunk[:remaining])
                    total_bytes = max_bytes
                    break
                chunks.append(chunk)
                total_bytes += len(chunk)
            final_url = str(resp.url)
            encoding = resp.encoding or "utf-8"

    return b"".join(chunks).decode(encoding, errors="replace"), final_url, status_code


def _extract_title_and_markdown(html: str) -> tuple[str, str]:
    title_match = _TITLE_RE.search(html)
    title = re.sub(r"\s+", " ", title_match.group(1)).strip() if title_match else ""

    extracted = trafilatura.extract(
        html,
        include_comments=False,
        include_links=True,
        favor_recall=True,
        output_format="markdown",
    )
    if extracted:
        return title, extracted

    soup = BeautifulSoup(html, "html.parser")
    if not title and soup.title and soup.title.string:
        title = soup.title.string.strip()

    for tag in soup(["script", "style", "noscript", "svg", "nav", "footer", "aside"]):
        tag.decompose()

    fallback_text = "\n".join(
        line.strip() for line in soup.get_text("\n").splitlines() if line.strip()
    )
    return title, fallback_text


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

        t0 = time.perf_counter()
        html, final_url, status_code = _fetch_html_capped(
            safe_url, headers, MAX_HTML_BYTES
        )
        fetch_ms = int((time.perf_counter() - t0) * 1000)

        t1 = time.perf_counter()
        title, raw_content = _extract_title_and_markdown(html)
        full_text = _absolutize_links(raw_content, final_url)
        reader_input = full_text[:MAX_RAW_READ_CHARS]
        extract_ms = int((time.perf_counter() - t1) * 1000)

        t2 = time.perf_counter()
        if reader_input.strip():
            reader_resp = llm_client.chat.completions.create(
                model=VLLM_MODEL,
                temperature=0.1,
                messages=[
                    {"role": "system", "content": READER_SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": (
                            f"URL: {final_url}\n"
                            f"Title: {title}\n"
                            f"Topic: {topic}\n\n"
                            f"Page Content:\n{reader_input}"
                        ),
                    },
                ],
            )
            raw_summary = reader_resp.choices[0].message.content or ""
            focused_extract = strip_think_blocks(raw_summary)[:MAX_EXTRACTED_CHARS]
        else:
            focused_extract = "No readable text could be extracted from this page."
        llm_ms = int((time.perf_counter() - t2) * 1000)

        duration_ms = int((time.perf_counter() - start) * 1000)

        model_output = (
            f"URL: {final_url}\n"
            f"Title: {title}\n"
            f"Topic: {topic}\n\n"
            f"{focused_extract}"
        )

        telemetry = {
            "url": url,
            "final_url": final_url,
            "title": title,
            "topic": topic,
            "matches_target": matched,
            "status_code": status_code,
            "full_extracted_chars": len(full_text),
            "reader_input_chars": len(reader_input),
            "focused_output_chars": len(focused_extract),
            "extracted_excerpt": full_text[:10_000],
            "focused_extract": focused_extract,
            "fetch_ms": fetch_ms,
            "extract_ms": extract_ms,
            "llm_ms": llm_ms,
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
            "fetch_ms": 0,
            "extract_ms": 0,
            "llm_ms": 0,
            "duration_ms": duration_ms,
            "error": err_msg,
        }
        return json.dumps({"url": url, "error": err_msg}), telemetry