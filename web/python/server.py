import json
import os
from datetime import datetime, timezone
from typing import Any
import uvicorn

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pymongo import ASCENDING, MongoClient

from helper import normalize_domain, strip_think_blocks
from llm import VLLM_MODEL, llm_client
from extract import run_extract_page
from web import run_web_search

# ---------------------------------------------------------------------------
# Config & MongoDB Setup (Local vLLM + Localhost MongoDB)
# ---------------------------------------------------------------------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "geo_aeo_lab")

MAX_STEPS = 8
MAX_TOOL_TEXT_CHARS = 5000


mongo_client = MongoClient(MONGO_URI)
db = mongo_client[MONGO_DB]

db.runs.create_index([("created_at", -1)])
db.steps.create_index([("run_id", ASCENDING), ("seq", ASCENDING)])

app = FastAPI(title="GEO / AEO Agent Backend (vLLM)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:30100"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------
class CreateRunRequest(BaseModel):
    question: str = Field(..., min_length=1)
    target_url: str | None = None
    max_results: int = Field(default=5, ge=1, le=10)

# ---------------------------------------------------------------------------
# Tool Definitions & Prompt
# ---------------------------------------------------------------------------
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search the web for current information, sources, and relevant pages.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Concise search query keywords.",
                    }
                },
                "required": ["query"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "fetch_page",
            "description": "Fetch and extract readable text from a specific URL.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "Full http or https URL to read.",
                    },
                    "topic": {
                        "type": "string",
                        "description": "What specific information or angle to extract from the page.",
                    },
                },
                "required": ["url", "topic"],
                "additionalProperties": False,
            },
        },
    },
]

SYSTEM_PROMPT = """You are a helpful AI assistant equipped with `web_search` and `fetch_page` tools.
Use `web_search` to find relevant sources and `fetch_page` when you need deeper details from a promising page.
Answer the user's question clearly and concisely based on the information you gather."""


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.post("/api/runs")
def create_and_execute_run(req: CreateRunRequest):
    target_domain = normalize_domain(req.target_url)
    now = datetime.now(timezone.utc)

    run_doc = {
        "target_url": req.target_url,
        "target_domain": target_domain,
        "question": req.question,
        "model": VLLM_MODEL,
        "status": "running",
        "final_answer": None,
        "step_count": 0,
        "error": None,
        "created_at": now,
        "completed_at": None,
    }
    run_oid = db.runs.insert_one(run_doc).inserted_id
    run_id = str(run_oid)

    messages: list[dict[str, Any]] = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": req.question},
    ]

    seq = 0
    final_answer: str | None = None

    try:
        for _ in range(MAX_STEPS):
            response = llm_client.chat.completions.create(
                model=VLLM_MODEL,
                messages=messages,
                tools=TOOLS,
                tool_choice="auto",
                temperature=0.2,
            )
            msg = response.choices[0].message
            tool_calls = msg.tool_calls or []
            clean_content = strip_think_blocks(msg.content)

            assistant_entry: dict[str, Any] = {
                "role": "assistant",
                "content": clean_content,
            }
            if tool_calls:
                assistant_entry["tool_calls"] = [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in tool_calls
                ]
            messages.append(assistant_entry)

            if not tool_calls:
                final_answer = clean_content
                break

            for tc in tool_calls:
                seq += 1
                tool_name = tc.function.name
                try:
                    args = json.loads(tc.function.arguments or "{}")
                except json.JSONDecodeError:
                    args = {}

                if tool_name == "web_search":
                    query = str(args.get("query", "")).strip()
                    model_output, telemetry = run_web_search(
                        query=query,
                        max_results=req.max_results,
                        target_domain=target_domain,
                    )
                elif tool_name in ("fetch_page", "extract_page"):
                    url = str(args.get("url", "")).strip()
                    topic = str(args.get("topic") or req.question).strip()
                    model_output, telemetry = run_extract_page(
                        url=url,
                        topic=topic,
                        target_domain=target_domain,
                    )
                else:
                    model_output = json.dumps({"error": f"Unknown tool: {tool_name}"})
                    telemetry = {"error": f"Unknown tool: {tool_name}"}

                db.steps.insert_one(
                    {
                        "run_id": run_id,
                        "seq": seq,
                        "tool_call_id": tc.id,
                        "tool_name": tool_name,
                        "arguments": args,
                        "model_output": model_output,
                        "telemetry": telemetry,
                        "created_at": datetime.now(timezone.utc),
                    }
                )

                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": model_output,
                    }
                )

        if final_answer is None:
            wrap_resp = llm_client.chat.completions.create(
                model=VLLM_MODEL,
                messages=messages,
                temperature=0.2,
            )
            final_answer = strip_think_blocks(wrap_resp.choices[0].message.content)

        db.runs.update_one(
            {"_id": run_oid},
            {
                "$set": {
                    "status": "completed",
                    "final_answer": final_answer,
                    "step_count": seq,
                    "completed_at": datetime.now(timezone.utc),
                }
            },
        )

        return {
            "run_id": run_id,
            "status": "completed",
            "final_answer": final_answer,
            "step_count": seq,
        }

    except Exception as exc:
        err_msg = f"{type(exc).__name__}: {exc}"
        db.runs.update_one(
            {"_id": run_oid},
            {
                "$set": {
                    "status": "failed",
                    "error": err_msg,
                    "step_count": seq,
                    "completed_at": datetime.now(timezone.utc),
                }
            },
        )
        raise HTTPException(status_code=500, detail=err_msg) from exc


@app.get("/api/runs/{run_id}")
def get_run_detail(run_id: str):
    try:
        oid = ObjectId(run_id)
    except InvalidId as exc:
        raise HTTPException(status_code=400, detail="Invalid run_id") from exc

    run = db.runs.find_one({"_id": oid})
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    steps = list(db.steps.find({"run_id": run_id}).sort("seq", ASCENDING))
    for s in steps:
        s["id"] = str(s.pop("_id"))

    run["id"] = str(run.pop("_id"))
    return {"run": run, "steps": steps}


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "30200"))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    uvicorn.run("server:app", host=host, port=port, reload=reload)
