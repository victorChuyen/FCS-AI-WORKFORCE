import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const match = envContent.match(/VITE_GEMINI_API_KEYS="([^"]+)"/);
if (!match) {
  console.error('Không tìm thấy VITE_GEMINI_API_KEYS trong .env');
  process.exit(1);
}

const keys = match[1].split(',').map(k => k.trim()).filter(Boolean);
console.log(`\n======================================================`);
console.log(`🤖 KIỂM TRA POOL ${keys.length} KEYS GOOGLE GEMINI SOTA`);
console.log(`======================================================\n`);

async function callGemini(key, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 60,
          temperature: 0.2
        }
      })
    });
    const dur = Date.now() - t0;
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, dur, error: `${res.status} - ${err?.error?.message || res.statusText}` };
    }
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    return { ok: true, dur, text };
  } catch (err) {
    return { ok: false, dur: Date.now() - t0, error: err.message };
  }
}

let active38 = 0;
let active36 = 0;

for (let i = 0; i < keys.length; i++) {
  const key = keys[i];
  const maskedKey = key.slice(0, 10) + '...' + key.slice(-4);
  
  // Test gemini-3.8-flash first
  const res38 = await callGemini(key, 'gemini-3.8-flash', 'Chào Lucky');
  // Test gemini-3.6-flash
  const res36 = await callGemini(key, 'gemini-3.6-flash', 'Chào Lucky');

  const status38 = res38.ok ? `✅ 3.8-Flash (${res38.dur}ms)` : `❌ 3.8: ${res38.error?.slice(0, 30)}`;
  const status36 = res36.ok ? `✅ 3.6-Flash (${res36.dur}ms)` : `❌ 3.6: ${res36.error?.slice(0, 30)}`;

  if (res38.ok) active38++;
  if (res36.ok) active36++;

  console.log(`Key #${String(i + 1).padStart(2, ' ')} [${maskedKey}] | ${status38} | ${status36}`);
}

console.log(`\n------------------------------------------------------`);
console.log(`📊 TỔNG KẾT POOL:`);
console.log(`- gemini-3.8-flash (Primary SOTA): ${active38}/${keys.length} keys hoạt động`);
console.log(`- gemini-3.6-flash (Super Workhorse): ${active36}/${keys.length} keys hoạt động`);
console.log(`======================================================\n`);
