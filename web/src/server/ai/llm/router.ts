import { callOllamaJson } from "./ollama";
import { callVllmJson } from "./vllm";

const MODE = process.env.LLM || "ollama";

/**
 * Contract for any LLM backend (Ollama, vLLM, OpenAI, etc.)
 */
export type LlmJsonCaller = (
  systemPrompt: string,
  userPrompt: string,
) => Promise<string>;

export const callLLM: LlmJsonCaller =
  MODE === "vLLM" ? callVllmJson : callOllamaJson;
