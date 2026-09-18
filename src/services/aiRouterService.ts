/**
 * 🚀 FCS AI Workforce OS — 9Router AI Gateway Integration Service
 * Endpoint: http://localhost:20128/v1 (OpenAI-compatible)
 * Fallback Tunnel: https://ruvxwm8.abc-tunnel.us/v1
 * Primary Combo: fcs-astra (cx/gpt-6-astra + Auto-fallback)
 */

export const AI_ROUTER_CONFIG = {
  localBaseUrl: 'http://localhost:20128/v1',
  tunnelBaseUrl: 'https://ruvxwm8.abc-tunnel.us/v1',
  apiKey: 'sk-7c1f91635f52dc7e-fcsworkforce-2026',
  models: {
    coreAstra: 'fcs-astra',               // 🏆 COMBO CHÍNH: cx/gpt-6-astra + auto-fallback
    deepReasoning: 'cx/gpt-6-astra',       // Trực tiếp GPT-6 Astra
    fastCode: 'ag/claude-sonnet-4-6',     // ~2s response, tối ưu React/UI
    highContext: 'ag/gemini-3.8-flash',   // 1M context, xử lý CV lao động hàng loạt
    coderExpert: 'kr/qwen3-coder-next',   // Chuyên gia Apps Script & DB SQL
  }
} as const;

export type AiModelKey = keyof typeof AI_ROUTER_CONFIG.models;

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionOptions {
  model?: string;
  modelKey?: AiModelKey;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Executes chat completion through 9Router AI Gateway with automatic local/tunnel fallback.
 * Uses `fcs-astra` (cx/gpt-6-astra) as default.
 */
export async function callAiRouter(
  messages: AiChatMessage[],
  options: AiCompletionOptions = {}
): Promise<string> {
  const model = options.model || (options.modelKey ? AI_ROUTER_CONFIG.models[options.modelKey] : AI_ROUTER_CONFIG.models.coreAstra);
  const payload = {
    model,
    messages,
    stream: false,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 2048,
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AI_ROUTER_CONFIG.apiKey}`,
  };

  // Try local first, fallback to tunnel
  const endpoints = [
    `${AI_ROUTER_CONFIG.localBaseUrl}/chat/completions`,
    `${AI_ROUTER_CONFIG.tunnelBaseUrl}/chat/completions`,
  ];

  let lastError: any = null;

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`AI Router Error HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (reply) return reply;
    } catch (err: any) {
      lastError = err;
      console.warn(`[AI Router] Endpoint failed: ${url}, trying next...`, err.message);
    }
  }

  throw new Error(`All AI Router endpoints failed. Last error: ${lastError?.message}`);
}
