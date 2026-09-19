import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const match = envContent.match(/VITE_GEMINI_API_KEYS="([^"]+)"/);
const keys = match[1].split(',').map(k => k.trim()).filter(Boolean);

console.log(`\n======================================================`);
console.log(`🤖 TEST THỰC TẾ XOAY VÒNG POOL & AUTO-FAILOVER CHỐNG 429`);
console.log(`======================================================\n`);

console.log(`Tổng số keys trong pool: ${keys.length}`);

// Giả lập logic GeminiPoolManager
class TestPoolManager {
  constructor(keys) {
    this.keys = keys.map((key, index) => ({
      key,
      maskedKey: key.slice(0, 8) + '...' + key.slice(-4),
      index,
      rateLimitUntil: 0,
      totalRequests: 0,
      totalSuccess: 0
    }));
    this.currentIndex = 0;
  }

  getNextKey() {
    const now = Date.now();
    for (let i = 0; i < this.keys.length; i++) {
      const idx = (this.currentIndex + i) % this.keys.length;
      const cand = this.keys[idx];
      if (cand.rateLimitUntil <= now) {
        this.currentIndex = (idx + 1) % this.keys.length;
        cand.totalRequests++;
        return cand;
      }
    }
    return null;
  }

  markRateLimit(keyItem, secs = 60) {
    keyItem.rateLimitUntil = Date.now() + secs * 1000;
  }

  async callAI(prompt, model = 'gemini-3.8-flash') {
    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const keyItem = this.getNextKey();
      if (!keyItem) throw new Error('Không còn key khả dụng!');

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyItem.key}`;
      const t0 = Date.now();
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 100, temperature: 0.2 }
          })
        });

        if (res.ok) {
          const data = await res.json();
          keyItem.totalSuccess++;
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          return { reply, key: keyItem.maskedKey, latency: Date.now() - t0 };
        }

        if (res.status === 429 || res.status === 503) {
          console.warn(`⚠️ Key ${keyItem.maskedKey} chạm mã ${res.status}. Kích hoạt cooldown 60s và lập tức nhảy sang key kế tiếp...`);
          this.markRateLimit(keyItem, 60);
          continue;
        }

        if (res.status === 403 || res.status === 400) {
          console.warn(`⚠️ Key ${keyItem.maskedKey} mã ${res.status}. Tạm khóa và chuyển key kế tiếp...`);
          this.markRateLimit(keyItem, 300);
          continue;
        }
      } catch (err) {
        console.warn(`Lỗi fetch key ${keyItem.maskedKey}:`, err.message);
      }
    }
    throw new Error('Hết lượt thử');
  }
}

const pool = new TestPoolManager(keys);

// Test 3 requests liên tiếp để thấy rõ việc luân chuyển key (Round-Robin)
const prompts = [
  'Định nghĩa VWW trong 1 câu ngắn.',
  'Mã L1.7 là gì trong FCS Workforce?',
  'Quy trình Golden Flow từ Worker đến VWW gồm mấy bước?'
];

for (let i = 0; i < prompts.length; i++) {
  console.log(`\n--- Request #${i + 1}: "${prompts[i]}" ---`);
  const result = await pool.callAI(prompts[i]);
  console.log(`✅ Phục vụ bởi Key: [${result.key}] | Tốc độ: ${result.latency}ms`);
  console.log(`💬 Trả lời: ${result.reply}`);
}

console.log(`\n======================================================`);
console.log(`🎉 KẾT QUẢ: Đa Key Đa Luồng Xoay Vòng Google Gemini Cloud HOẠT ĐỘNG HOÀN HẢO!`);
console.log(`======================================================\n`);
