/**
 * 🚀 FCS AI WORKFORCE OS — 24/7 SOTA GEMINI MULTI-KEY ROTATING POOL
 * 
 * Tính năng lõi:
 * 1. Đa Key (13 Keys): Tự động nạp từ VITE_GEMINI_API_KEYS hoặc VITE_GEMINI_API_KEY_1..13
 * 2. Đa Luồng Xoay Vòng (Round-Robin & Load Balancing): Phân bổ tải đều, không nghẽn
 * 3. Chống 429 Tự Động (Auto-Cooldown & Instant Failover): Khi 1 key chạm Rate Limit 429,
 *    key đó được cách ly 60s, request lập tức chuyển sang key tiếp theo mà không làm gián đoạn người dùng.
 * 4. Thác Mô Hình (Model Waterfall):
 *    - Ưu tiên 1: gemini-3.8-flash (Tư duy sâu, tốc độ cao SOTA)
 *    - Ưu tiên 2: gemini-3.6-flash (Cỗ máy cày 12-key siêu bền bỉ)
 * 5. Chuẩn SaaS 24/7: Kết nối trực tiếp HTTPS Google Generative Language API,
 *    chạy mượt mà trên Điện thoại, Máy tính bảng, Web Online (Cloudflare Pages fcs.breaths.live)
 *    kể cả khi máy tính của Chairman Victor đã tắt!
 */

export interface GeminiKeyStatus {
  key: string;
  maskedKey: string;
  index: number;
  isActive: boolean;
  rateLimitUntil: number; // timestamp in ms
  consecutiveErrors: number;
  lastUsedAt: number;
  totalRequests: number;
  totalSuccess: number;
}

export interface GeminiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GeminiGenerationOptions {
  model?: 'gemini-3.8-flash' | 'gemini-3.6-flash' | string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface PoolStats {
  totalKeys: number;
  activeKeys: number;
  coolingDownKeys: number;
  totalRequestsServed: number;
  currentKeyIndex: number;
}

class GeminiPoolManager {
  private keys: GeminiKeyStatus[] = [];
  private currentIndex = 0;
  private isInitialized = false;

  constructor() {
    this.initKeys();
  }

  private initKeys() {
    if (this.isInitialized) return;

    const rawKeys: string[] = [];

    // 1. Check VITE_GEMINI_API_KEYS (comma-separated list)
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEYS) {
      const parts = String(import.meta.env.VITE_GEMINI_API_KEYS)
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);
      rawKeys.push(...parts);
    }

    // 2. Check individual VITE_GEMINI_API_KEY_1..13
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      for (let i = 1; i <= 20; i++) {
        const key = import.meta.env[`VITE_GEMINI_API_KEY_${i}`];
        if (key && typeof key === 'string' && key.trim() && !rawKeys.includes(key.trim())) {
          rawKeys.push(key.trim());
        }
      }
    }

    // 3. Fallback to process.env if in Node environment (testing/SSR)
    if (rawKeys.length === 0 && typeof process !== 'undefined' && process.env) {
      if (process.env.VITE_GEMINI_API_KEYS) {
        rawKeys.push(...process.env.VITE_GEMINI_API_KEYS.split(',').map(k => k.trim()).filter(Boolean));
      }
      for (let i = 1; i <= 20; i++) {
        const k = process.env[`VITE_GEMINI_API_KEY_${i}`];
        if (k && !rawKeys.includes(k.trim())) rawKeys.push(k.trim());
      }
    }

    // Deduplicate
    const uniqueKeys = Array.from(new Set(rawKeys));

    this.keys = uniqueKeys.map((key, index) => ({
      key,
      maskedKey: key.length > 12 ? `${key.slice(0, 8)}...${key.slice(-4)}` : 'Key-' + (index + 1),
      index,
      isActive: true,
      rateLimitUntil: 0,
      consecutiveErrors: 0,
      lastUsedAt: 0,
      totalRequests: 0,
      totalSuccess: 0,
    }));

    this.isInitialized = true;
  }

  public getPoolStats(): PoolStats {
    this.initKeys();
    const now = Date.now();
    const active = this.keys.filter(k => k.isActive && k.rateLimitUntil <= now).length;
    const cooling = this.keys.filter(k => k.rateLimitUntil > now).length;
    const totalRequests = this.keys.reduce((sum, k) => sum + k.totalRequests, 0);

    return {
      totalKeys: this.keys.length,
      activeKeys: active,
      coolingDownKeys: cooling,
      totalRequestsServed: totalRequests,
      currentKeyIndex: this.currentIndex,
    };
  }

  /**
   * Select the next healthy key in round-robin fashion, skipping cooling down keys
   */
  private getNextAvailableKey(): GeminiKeyStatus | null {
    this.initKeys();
    if (this.keys.length === 0) return null;

    const now = Date.now();
    const total = this.keys.length;

    for (let attempt = 0; attempt < total; attempt++) {
      const idx = (this.currentIndex + attempt) % total;
      const candidate = this.keys[idx];

      if (candidate.isActive && candidate.rateLimitUntil <= now) {
        this.currentIndex = (idx + 1) % total;
        candidate.lastUsedAt = now;
        candidate.totalRequests++;
        return candidate;
      }
    }

    // If all keys are in cooldown, find the key that will become available earliest
    const earliestKey = [...this.keys].sort((a, b) => a.rateLimitUntil - b.rateLimitUntil)[0];
    if (earliestKey) {
      earliestKey.totalRequests++;
      return earliestKey;
    }

    return null;
  }

  private markRateLimit(keyStatus: GeminiKeyStatus, cooldownSeconds = 60) {
    keyStatus.rateLimitUntil = Date.now() + cooldownSeconds * 1000;
    keyStatus.consecutiveErrors++;
  }

  private markSuccess(keyStatus: GeminiKeyStatus) {
    keyStatus.totalSuccess++;
    keyStatus.consecutiveErrors = 0;
    keyStatus.rateLimitUntil = 0;
  }

  private markError(keyStatus: GeminiKeyStatus, permanent = false) {
    keyStatus.consecutiveErrors++;
    if (permanent || keyStatus.consecutiveErrors >= 5) {
      // Cooldown for 5 minutes if persistent errors
      keyStatus.rateLimitUntil = Date.now() + 300 * 1000;
    }
  }

  /**
   * Convert standard chat messages into Google Gemini generateContent payload
   */
  private formatGeminiPayload(
    messages: GeminiChatMessage[],
    options: GeminiGenerationOptions = {}
  ) {
    let systemInstruction: string | undefined = undefined;
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = systemInstruction ? `${systemInstruction}\n\n${msg.content}` : msg.content;
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Gemini API requires at least one user content
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello' }],
      });
    }

    const payload: any = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens ?? 2048,
      },
    };

    if (systemInstruction) {
      payload.system_instruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    return payload;
  }

  /**
   * Primary method: Multi-threaded rotating call with automatic key failover and model waterfall
   */
  public async generateContent(
    messages: GeminiChatMessage[],
    options: GeminiGenerationOptions = {}
  ): Promise<string> {
    this.initKeys();

    if (this.keys.length === 0) {
      throw new Error('Chưa cấu hình Gemini API Key trong biến VITE_GEMINI_API_KEYS');
    }

    // Models in waterfall order: Primary (3.8-flash) -> Fallback (3.6-flash)
    const preferredModel = options.model || 'gemini-3.8-flash';
    const modelsToTry = preferredModel === 'gemini-3.8-flash'
      ? ['gemini-3.8-flash', 'gemini-3.6-flash']
      : [preferredModel, 'gemini-3.6-flash'];

    const timeoutMs = options.timeoutMs ?? 8000;
    const maxKeyAttempts = Math.min(this.keys.length, 4); // Try up to 4 rotated keys

    let lastError: any = null;

    for (const model of modelsToTry) {
      for (let attempt = 0; attempt < maxKeyAttempts; attempt++) {
        const keyItem = this.getNextAvailableKey();
        if (!keyItem) break;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyItem.key}`;
        const payload = this.formatGeminiPayload(messages, options);

        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          clearTimeout(timer);

          if (response.ok) {
            const data = await response.json();
            const parts = data?.candidates?.[0]?.content?.parts;
            const text = Array.isArray(parts)
              ? parts.map((p: any) => p?.text || '').filter(Boolean).join('')
              : (parts?.[0]?.text || '');

            if (text && text.trim()) {
              this.markSuccess(keyItem);
              return text.trim();
            }
          }

          // Handle specific HTTP Status codes
          const errData = await response.json().catch(() => ({}));
          const errMessage = errData?.error?.message || response.statusText;

          if (response.status === 429) {
            // Rate limit encountered -> Cooldown this key for 60s and immediately try next key
            this.markRateLimit(keyItem, 60);
            lastError = new Error(`Key ${keyItem.maskedKey} hit 429: ${errMessage}`);
            continue;
          }

          if (response.status === 404) {
            // Model not found for this key or deprecated -> break to next model
            lastError = new Error(`Model ${model} not available on key ${keyItem.maskedKey}`);
            break;
          }

          if (response.status === 400 || response.status === 403) {
            // Invalid key or permission issue
            this.markError(keyItem, true);
            lastError = new Error(`Key ${keyItem.maskedKey} error (${response.status}): ${errMessage}`);
            continue;
          }

          // General server error (500, 503) -> cooldown 30s and try next key
          this.markRateLimit(keyItem, 30);
          lastError = new Error(`Gemini server error ${response.status}: ${errMessage}`);
        } catch (fetchErr: any) {
          if (fetchErr.name === 'AbortError') {
            this.markRateLimit(keyItem, 30);
            lastError = new Error(`Request timeout (${timeoutMs}ms) on key ${keyItem.maskedKey}`);
          } else {
            this.markError(keyItem, false);
            lastError = fetchErr;
          }
        }
      }
    }

    throw lastError || new Error('Tất cả các keys trong Gemini Pool đều không phản hồi');
  }
}

export const geminiPool = new GeminiPoolManager();
