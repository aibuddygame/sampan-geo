// ============================================================================
// 1. LLM ADAPTERS (Swappable execution layer)
// ============================================================================

import { Ollama } from "ollama";
import { LlmJsonCaller } from "./router";

const ollama = new Ollama({
  host: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
});
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3.5";

/**
 * Adapter for local Ollama SDK
 */
export const callOllamaJson: LlmJsonCaller = async (
  systemPrompt,
  userPrompt,
) => {
  const response = await ollama.chat({
    model: OLLAMA_MODEL,
    format: "json",
    stream: false,
    options: {
      temperature: 0.1,
    },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return response.message?.content || "{}";
};
