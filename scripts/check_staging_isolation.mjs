/** Validate private source captures and declared staging isolation. No cloud calls or writes. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const reject = code => { throw new Error(code); };
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const idPattern = /^[A-Za-z0-9_-]{10,250}$/;
const hashPattern = /^[a-f0-9]{64}$/;
const productionHosts = new Set(['fcs.breaths.live', 'fcs-ai-workforce.pages.dev']);
const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

function sourceIdentity(source) {
  if (!isObject(source) || !idPattern.test(source.scriptId || '') || !idPattern.test(source.deploymentId || '') ||
      source.scriptId === source.deploymentId || !Number.isSafeInteger(source.versionNumber) || source.versionNumber < 1 ||
      !hashPattern.test(source.sourceSha256 || '')) reject('INVALID_SOURCE_MANIFEST');
}

async function readPrivateJson(root, name) {
  const file = path.join(root, name);
  const stat = await fs.lstat(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 20 * 1024 * 1024) reject('INVALID_CAPTURE_FILE');
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

/** Accepts the existing export_deployed_apps_script.mjs output without changing its format. */
export async function verifySourceCapture(directory) {
  const root = path.resolve(directory);
  const stat = await fs.lstat(root);
  if (!stat.isDirectory() || stat.isSymbolicLink()) reject('INVALID_CAPTURE_DIRECTORY');
  const manifest = await readPrivateJson(root, 'manifest.json');
  const source = await readPrivateJson(root, 'source.private.json');
  sourceIdentity(manifest);
  if (source.scriptId !== manifest.scriptId || source.versionNumber !== manifest.versionNumber ||
      !Array.isArray(source.files) || !source.files.length || !Array.isArray(manifest.files)) reject('CAPTURE_IDENTITY_MISMATCH');
  const seen = new Set();
  const expected = source.files.map(file => {
    if (!isObject(file) || typeof file.name !== 'string' || !file.name ||
        !['SERVER_JS', 'HTML', 'JSON'].includes(file.type) || typeof file.source !== 'string') reject('INVALID_SOURCE_FILE');
    const key = file.type + ':' + file.name;
    if (seen.has(key)) reject('DUPLICATE_SOURCE_FILE');
    seen.add(key);
    const digest = sha256(file.source);
    if (digest !== file.sha256) reject('SOURCE_HASH_MISMATCH');
    return { name: file.name, type: file.type, sha256: digest };
  });
  const appManifest = source.files.filter(file => file.name === 'appsscript' && file.type === 'JSON');
  if (appManifest.length !== 1 || !isObject(JSON.parse(appManifest[0].source))) reject('APPS_SCRIPT_MANIFEST_REQUIRED');
  if (JSON.stringify(expected) !== JSON.stringify(manifest.files) ||
      sha256(JSON.stringify(expected.map(f => [f.name, f.type, f.sha256]).sort())) !== manifest.sourceSha256) reject('MANIFEST_HASH_MISMATCH');
  return manifest;
}

function sheetIds(values) {
  if (!Array.isArray(values) || !values.length ||
      values.some(value => typeof value !== 'string' || !idPattern.test(value)) ||
      new Set(values).size !== values.length) reject('COMPLETE_UNIQUE_SPREADSHEET_IDS_REQUIRED');
  return values;
}

function matchEndpoint(value, deploymentId) {
  let url;
  try { url = new URL(value); } catch { reject('INVALID_BACKEND_ENDPOINT'); }
  if (url.protocol !== 'https:' || url.hostname !== 'script.google.com' || url.port ||
      url.username || url.password || url.search || url.hash ||
      url.pathname !== '/macros/s/' + deploymentId + '/exec') reject('INVALID_BACKEND_ENDPOINT');
  return url.href;
}

export function validateStagingIsolation(production, staging, inventory) {
  sourceIdentity(production); sourceIdentity(staging);
  if (production.scriptId === staging.scriptId) reject('STAGING_NEEDS_SEPARATE_SCRIPT_PROJECT');
  if (production.deploymentId === staging.deploymentId) reject('STAGING_ENDPOINT_EQUALS_PRODUCTION');
  if (!isObject(inventory) || inventory.scriptPropertiesReviewed !== true || inventory.allDataResourcesListed !== true) reject('HUMAN_RESOURCE_INVENTORY_REVIEW_REQUIRED');
  if (inventory.productionSourceSha256 !== production.sourceSha256 || inventory.stagingSourceSha256 !== staging.sourceSha256) reject('SOURCE_DIGEST_MISMATCH');
  matchEndpoint(inventory.productionEndpoint, production.deploymentId);
  matchEndpoint(inventory.stagingEndpoint, staging.deploymentId);
  const productionSheets = sheetIds(inventory.productionSpreadsheetIds);
  const stagingSheets = sheetIds(inventory.stagingSpreadsheetIds);
  if (stagingSheets.some(id => productionSheets.includes(id))) reject('STAGING_SHARES_PRODUCTION_SPREADSHEET');
  let url;
  try { url = new URL(inventory.stagingFrontendUrl); } catch { reject('INVALID_STAGING_FRONTEND_URL'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash ||
      productionHosts.has(url.hostname) || url.hostname === 'localhost' ||
      url.hostname.startsWith('[') || /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)) reject('INVALID_STAGING_FRONTEND_URL');
  if (!/^[a-f0-9]{40}$/.test(inventory.frontendCommit || '')) reject('FRONTEND_COMMIT_REQUIRED');
  if (typeof inventory.reviewedBy !== 'string' || !inventory.reviewedBy.trim() ||
      typeof inventory.reviewedAtUtc !== 'string' || !Number.isFinite(Date.parse(inventory.reviewedAtUtc))) reject('INVENTORY_REVIEW_ATTRIBUTION_REQUIRED');
  return {
    status: 'ISOLATION_MANIFEST_VALID_NOT_LIVE_TESTED',
    frontendCommit: inventory.frontendCommit,
    sourceSha256: { production: production.sourceSha256, staging: staging.sourceSha256 },
    limitations: [
      'Resource inventory and review attribution are supplied assertions, not a cloud permissions audit.',
      'Local hashes detect inconsistency, not authenticity or current deployed source.',
      'Does not prove frontend URL/commit/backend pairing or API authorization.',
      'No token, membership, role, office, tenant, export or Golden Flow live test was run.',
      'NOT authorization to release.',
    ],
  };
}

async function main(args) {
  if (args.length !== 3) reject('USAGE_PRODUCTION_CAPTURE_STAGING_CAPTURE_PRIVATE_INVENTORY_JSON');
  const [production, staging] = await Promise.all([verifySourceCapture(args[0]), verifySourceCapture(args[1])]);
  const inventory = JSON.parse(await fs.readFile(args[2], 'utf8'));
  console.log(JSON.stringify(validateStagingIsolation(production, staging, inventory), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(error => {
    console.error(/^[A-Z][A-Z0-9_]+$/.test(error?.message || '') ? error.message : 'ISOLATION_CHECK_FAILED');
    process.exitCode = 1;
  });
}
