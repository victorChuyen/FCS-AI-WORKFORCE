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

console.log(`Extracted ${geminiKeys.length} keys from ${leadsEnvPath}`);

const fcsEnvPath = 'd:/FCS-AI-WORKFORCE/.env';
let currentFcsEnv = fs.readFileSync(fcsEnvPath, 'utf8');

// Filter out old GEMINI entries
const cleanLines = currentFcsEnv.split('\n').filter(l => !l.includes('GEMINI_API_KEY'));
let newFcsEnv = cleanLines.join('\n').trim();

newFcsEnv += '\n\n# ========================================================\n';
newFcsEnv += '# 🤖 GOOGLE GEMINI SOTA 24/7 CLOUD MULTI-KEY ROTATING POOL\n';
newFcsEnv += '# ========================================================\n';
newFcsEnv += `VITE_GEMINI_API_KEYS="${geminiKeys.join(',')}"\n`;

geminiKeys.forEach((key, idx) => {
  newFcsEnv += `VITE_GEMINI_API_KEY_${idx + 1}="${key}"\n`;
});

fs.writeFileSync(fcsEnvPath, newFcsEnv, 'utf8');
console.log(`✅ Đã đồng bộ thành công ${geminiKeys.length} Gemini API Keys vào ${fcsEnvPath}!`);
