import fs from 'fs';

const leadsEnvPath = 'd:/0_LEADS/.env';
const lines = fs.readFileSync(leadsEnvPath, 'utf8').split('\n');
const geminiKeys = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('GEMINI_API_KEY')) {
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (val && !geminiKeys.includes(val)) {
        geminiKeys.push(val);
      }
    }
  }
}

console.log(`Testing all 13 keys with models: gemini-3.6-flash, gemini-3.8-flash, gemini-2.5-flash...`);

const modelsToTry = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-2.5-flash'];

for (const model of modelsToTry) {
  console.log(`\n🧪 Testing Model: ${model}`);
  const results = await Promise.all(geminiKeys.map(async (key, idx) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const start = Date.now();
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'PONG' }] }]
        })
      });
      const latency = Date.now() - start;
      if (resp.ok) {
        return { keyIdx: idx + 1, status: 'OK', latency, keyPrefix: key.slice(0, 8) + '...' + key.slice(-4) };
      } else {
        const err = await resp.json();
        return { keyIdx: idx + 1, status: 'ERR', code: resp.status, msg: err?.error?.message?.slice(0, 70), keyPrefix: key.slice(0, 8) };
      }
    } catch(e) {
      return { keyIdx: idx + 1, status: 'NETWORK_ERR', msg: e.message };
    }
  }));

  const active = results.filter(r => r.status === 'OK').length;
  console.log(`Model ${model}: ${active} / ${geminiKeys.length} keys active!`);
  if (active > 0) {
    console.table(results.filter(r => r.status === 'OK'));
  }
}
