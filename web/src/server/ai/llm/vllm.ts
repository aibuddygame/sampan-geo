import { LlmJsonCaller } from "./router";

/**
 * Ready-to-use adapter for vLLM (OpenAI-compatible /v1/chat/completions endpoint)
 */
export const callVllmJson: LlmJsonCaller = async (systemPrompt, userPrompt) => {
  const baseUrl = process.env.VLLM_BASE_URL || "http://localhost:33366/v1";
  const model = "cyankiwi/Qwen3.5-9B-AWQ-4bit";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.VLLM_API_KEY
        ? { Authorization: `Bearer ${process.env.VLLM_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`vLLM request failed (${response.status})`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "{}";
};
