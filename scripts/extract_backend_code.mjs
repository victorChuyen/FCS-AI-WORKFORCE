import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const suitePath = path.join(rootDir, 'src', 'services', 'appsScriptSuite.ts');
const content = fs.readFileSync(suitePath, 'utf8');

const startTag = 'export const GAS_V4_BACKEND_CODE = `';
const endTag = '`;';

const startIndex = content.indexOf(startTag);
if (startIndex === -1) {
  console.error('Could not find start of GAS_V4_BACKEND_CODE');
  process.exit(1);
}

const codeStart = startIndex + startTag.length;
const endIndex = content.lastIndexOf(endTag);
const gasCode = content.substring(codeStart, endIndex);

const outDir = path.join(rootDir, 'backend');
fs.mkdirSync(outDir, { recursive: true });

const outFile = path.join(outDir, 'Code.gs');
fs.writeFileSync(outFile, gasCode, 'utf8');

console.log(`✅ Successfully extracted: ${outFile} (${(gasCode.length / 1024).toFixed(1)} KB)`);
