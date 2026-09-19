export function getOpenRouterApiKey(): string | null {
  const key =
    process.env.OPENROUTER_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "";
  if (key && key.trim().length > 0) {
    return key.trim();
  }
  return null;
}

export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Default model hierarchy: fast & cost-efficient Claude 3 Haiku, with fallback to Sonnet
export const PRIMARY_MODEL = "anthropic/claude-3-haiku";
export const FALLBACK_MODELS = [
  "anthropic/claude-3-haiku",
  "anthropic/claude-sonnet-4.6",
];
export const MAX_TOKENS = 1200;

export interface OpenRouterCallOptions {
  system?: string;
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

/**
 * Executes a non-streaming chat completion via OpenRouter.
 */
export async function callOpenRouter(options: OpenRouterCallOptions): Promise<string> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY (or ANTHROPIC_API_KEY) is not configured in the environment.");
  }

  const allMessages: Array<{ role: string; content: string }> = [];
  if (options.system) {
    allMessages.push({ role: "system", content: options.system });
  }
  allMessages.push(...options.messages);

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://ai.studio",
      "X-Title": "Quantum-Q Talent Intelligence",
    },
    body: JSON.stringify({
      models: FALLBACK_MODELS,
      model: options.model || PRIMARY_MODEL,
      max_tokens: options.maxTokens || MAX_TOKENS,
      temperature: options.temperature ?? 0.2,
      messages: allMessages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("No response content received from OpenRouter API.");
  }
  return content;
}

/**
 * Streams chat completion tokens via OpenRouter Server-Sent Events.
 */
export async function* streamOpenRouter(options: OpenRouterCallOptions): AsyncGenerator<string, void, unknown> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY (or ANTHROPIC_API_KEY) is not configured in the environment.");
  }

  const allMessages: Array<{ role: string; content: string }> = [];
  if (options.system) {
    allMessages.push({ role: "system", content: options.system });
  }
  allMessages.push(...options.messages);

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://ai.studio",
      "X-Title": "Quantum-Q Talent Intelligence",
    },
    body: JSON.stringify({
      models: FALLBACK_MODELS,
      model: options.model || PRIMARY_MODEL,
      max_tokens: options.maxTokens || MAX_TOKENS,
      temperature: options.temperature ?? 0.3,
      stream: true,
      messages: allMessages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter stream error ${res.status}: ${errText}`);
  }

  if (!res.body) return;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const dataStr = trimmed.slice(6);
      if (dataStr === "[DONE]") return;
      try {
        const json = JSON.parse(dataStr);
        const text = json.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        // Skip unparseable chunks
      }
    }
  }
}
