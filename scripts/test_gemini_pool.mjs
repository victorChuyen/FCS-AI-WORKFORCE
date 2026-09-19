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

const testKey = geminiKeys[0];
const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${testKey}`;
const resp = await fetch(listUrl);
const data = await resp.json();

const genModels = (data.models || [])
  .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
  .map(m => m.name.replace('models/', ''));

console.log('Available generateContent models:', genModels);

// Now test calling gemini-2.5-flash
const callUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${testKey}`;
const genResp = await fetch(callUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Chào AI CEO Lucky, hãy chào lại Chairman Victor Chuyen trong 1 câu.' }] }]
  })
});
const genData = await genResp.json();
console.log('Chat response from Gemini 2.5 Flash:');
console.log(genData.candidates?.[0]?.content?.parts?.[0]?.text);
