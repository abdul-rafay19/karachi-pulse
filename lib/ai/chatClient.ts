// Provider-agnostic chat client for the civic assistant.
//
// Groq, OpenRouter, and NVIDIA NIM all expose the same OpenAI-compatible
// `/chat/completions` endpoint shape (including function/tool calling), so a
// single fetch-based client covers all three — swapping providers is a
// three-env-var change, no code change and no extra SDK dependency.
//
//   CHAT_PROVIDER_BASE_URL   e.g. https://api.groq.com/openai/v1
//   CHAT_PROVIDER_API_KEY    the provider's API key
//   CHAT_PROVIDER_MODEL      e.g. llama-3.3-70b-versatile
//
// Defaults target Groq because its free tier is fast enough for a live
// on-stage demo. To switch:
//   OpenRouter : CHAT_PROVIDER_BASE_URL=https://openrouter.ai/api/v1
//                CHAT_PROVIDER_MODEL=meta-llama/llama-3.3-70b-instruct:free
//   NVIDIA NIM : CHAT_PROVIDER_BASE_URL=https://integrate.api.nvidia.com/v1
//                CHAT_PROVIDER_MODEL=meta/llama-3.1-70b-instruct

export interface ChatToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_call_id?: string;
  tool_calls?: ChatToolCall[];
  name?: string;
}

export interface ChatToolDef {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

const DEFAULT_BASE_URL = "https://api.groq.com/openai/v1";
// Groq deprecated llama-3.3-70b-versatile (announced 2026-06-17, decommissioned
// 2026-08-16 on Free/Developer tiers). gpt-oss-120b is Groq's recommended
// replacement — strong quality and supports tool calling. If Groq deprecates
// this one too, just set CHAT_PROVIDER_MODEL, no code change needed.
const DEFAULT_MODEL = "openai/gpt-oss-120b";

export class ChatProviderUnavailableError extends Error {}

export function isChatConfigured(): boolean {
  return Boolean(process.env.CHAT_PROVIDER_API_KEY);
}

export function chatProviderName(): string {
  const base = process.env.CHAT_PROVIDER_BASE_URL || DEFAULT_BASE_URL;
  if (base.includes("groq")) return "Groq";
  if (base.includes("openrouter")) return "OpenRouter";
  if (base.includes("nvidia")) return "NVIDIA NIM";
  return "custom provider";
}

/**
 * Single call to the OpenAI-compatible `/chat/completions` endpoint.
 * Returns the assistant message (may contain `content`, `tool_calls`, or both).
 */
export async function createChatCompletion(input: {
  messages: ChatMessage[];
  tools?: ChatToolDef[];
  temperature?: number;
  maxTokens?: number;
}): Promise<ChatMessage> {
  const apiKey = process.env.CHAT_PROVIDER_API_KEY;
  if (!apiKey) {
    throw new ChatProviderUnavailableError("CHAT_PROVIDER_API_KEY is not configured");
  }

  const baseUrl = (process.env.CHAT_PROVIDER_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const model = process.env.CHAT_PROVIDER_MODEL || DEFAULT_MODEL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        // OpenRouter appreciates (does not require) these — harmless elsewhere.
        "HTTP-Referer": "https://karachi-pulse.app",
        "X-Title": "Karachi Pulse",
      },
      body: JSON.stringify({
        model,
        messages: input.messages,
        tools: input.tools,
        temperature: input.temperature ?? 0.4,
        max_tokens: input.maxTokens ?? 500,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new ChatProviderUnavailableError(
        `Chat provider responded ${res.status}: ${errText.slice(0, 200)}`
      );
    }

    const data = await res.json();
    const message = data?.choices?.[0]?.message;
    if (!message) {
      throw new ChatProviderUnavailableError("Chat provider returned no message");
    }
    return message as ChatMessage;
  } finally {
    clearTimeout(timeout);
  }
}
