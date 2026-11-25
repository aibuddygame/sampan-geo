import os

from openai import OpenAI

VLLM_BASE_URL = os.getenv("VLLM_BASE_URL", "http://localhost:33366/v1").rstrip("/")
VLLM_MODEL = os.getenv("VLLM_MODEL", "cyankiwi/Qwen3.5-9B-AWQ-4bit")
VLLM_API_KEY = os.getenv("VLLM_API_KEY") or "local-vllm"

llm_client = OpenAI(
    base_url=VLLM_BASE_URL,
    api_key=VLLM_API_KEY,
)
