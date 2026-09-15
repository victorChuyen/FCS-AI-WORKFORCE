/** Read-only Apps Script source capture. Never deploys, runs code or reads Sheet data. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const idPattern = /^[A-Za-z0-9_-]{10,250}$/;
const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');
function requireThat(ok, code) { if (!ok) throw new Error(code); }
function deployedVersion(value, scriptId, deploymentId) {
  requireThat(value?.deploymentId === deploymentId && value.deploymentConfig?.scriptId === scriptId,
    'DEPLOYMENT_IDENTITY_MISMATCH');
  const version = value.deploymentConfig.versionNumber;
  requireThat(Number.isSafeInteger(version) && version > 0, 'PINNED_VERSION_REQUIRED');
  requireThat(value.entryPoints?.some(e => e.entryPointType === 'WEB_APP'), 'WEB_APP_REQUIRED');
  return version;
}

export async function captureSource({ scriptId, deploymentId, token, fetchImpl = fetch }) {
  requireThat(idPattern.test(scriptId || '') && idPattern.test(deploymentId || ''), 'INVALID_IDS');
  requireThat(typeof token === 'string' && token.length >= 20 && token.length <= 16384 && !/\s/.test(token), 'INVALID_LOCAL_TOKEN');
  async function read(resource) {
    const response = await fetchImpl('https://script.googleapis.com/v1/projects/' + scriptId + resource, {
      method: 'GET', redirect: 'error', signal: AbortSignal.timeout(30000),
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' }
    });
    requireThat(response.ok, 'GOOGLE_READ_FAILED_HTTP_' + response.status);
    // Do not expose provider response/error bodies, tokens or source in logs.
    const raw = await response.text();
    requireThat(Buffer.byteLength(raw) <= 20 * 1024 * 1024, 'SOURCE_RESPONSE_TOO_LARGE');
    try { return JSON.parse(raw); } catch { throw new Error('INVALID_GOOGLE_JSON'); }
  }
  const deployment = await read('/deployments/' + deploymentId);
  const versionNumber = deployedVersion(deployment, scriptId, deploymentId);
  const source = await read('/content?versionNumber=' + versionNumber);
  requireThat(source.scriptId === scriptId && Array.isArray(source.files) && source.files.length > 0, 'SOURCE_IDENTITY_MISMATCH');
  const names = new Set();
  const files = source.files.map(file => {
    requireThat(typeof file.name === 'string' && typeof file.source === 'string' &&
      ['SERVER_JS', 'HTML', 'JSON'].includes(file.type), 'INVALID_SOURCE_FILE');
    const key = file.type + ':' + file.name;
    requireThat(!names.has(key), 'DUPLICATE_SOURCE_FILE'); names.add(key);
    return { name: file.name, type: file.type, source: file.source, sha256: sha256(file.source) };
  });
  requireThat(files.filter(f => f.name === 'appsscript' && f.type === 'JSON').length === 1, 'MANIFEST_REQUIRED');
  const after = await read('/deployments/' + deploymentId);
  requireThat(deployedVersion(after, scriptId, deploymentId) === versionNumber &&
    JSON.stringify(after.deploymentConfig) === JSON.stringify(deployment.deploymentConfig) &&
    JSON.stringify(after.entryPoints) === JSON.stringify(deployment.entryPoints) &&
    after.updateTime === deployment.updateTime, 'DEPLOYMENT_CHANGED_DURING_READ');
  const manifest = {
    capturedAt: new Date().toISOString(), scriptId, deploymentId, versionNumber,
    deploymentUpdateTime: deployment.updateTime || null,
    status: 'CAPTURED_NOT_REVIEWED_NOT_DEPLOYED',
    files: files.map(({ name, type, sha256: hash }) => ({ name, type, sha256: hash })),
    sourceSha256: sha256(JSON.stringify(files.map(f => [f.name, f.type, f.sha256]).sort()))
  };
  // Source may contain historical secrets. Keep local/private until security review.
  return { manifest, source: { scriptId, versionNumber, files } };
}

export function writeCapture(directory, capture) {
  // Exclusive creation: never overwrite an earlier capture or a symlink target.
  fs.mkdirSync(directory, { recursive: false, mode: 0o700 });
  fs.writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify(capture.manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  fs.writeFileSync(path.join(directory, 'source.private.json'), JSON.stringify(capture.source, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
}

async function main() {
  const [scriptId, deploymentId, outputDirectory, ...extra] = process.argv.slice(2);
  requireThat(!extra.length && outputDirectory, 'USAGE: node scripts/export_deployed_apps_script.mjs SCRIPT_ID DEPLOYMENT_ID NEW_PRIVATE_DIRECTORY');
  // Read a short-lived OAuth token from a local protected file, never a CLI arg.
  const tokenFile = process.env.FCS_GOOGLE_OAUTH_TOKEN_FILE;
  requireThat(tokenFile, 'LOCAL_OAUTH_TOKEN_FILE_REQUIRED');
  const stat = fs.lstatSync(tokenFile);
  requireThat(stat.isFile() && !stat.isSymbolicLink() && stat.size <= 16384, 'INVALID_TOKEN_FILE');
  requireThat(process.platform === 'win32' || (stat.mode & 0o077) === 0, 'TOKEN_FILE_MUST_BE_PRIVATE');
  const token = fs.readFileSync(tokenFile, 'utf8').trim();
  const capture = await captureSource({ scriptId, deploymentId, token });
  writeCapture(path.resolve(outputDirectory), capture);
  console.log(JSON.stringify({ status: 'CAPTURED_PRIVATE', versionNumber: capture.manifest.versionNumber,
    files: capture.manifest.files.length, sourceSha256: capture.manifest.sourceSha256 }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => {
    const known = /^(USAGE:|LOCAL_|INVALID_|TOKEN_|GOOGLE_|SOURCE_|DEPLOYMENT_|PINNED_|WEB_|DUPLICATE_|MANIFEST_)/;
    console.error(known.test(error.message) ? error.message : 'CAPTURE_FAILED_NO_CHANGES_MADE');
    process.exitCode = 1;
  });
}
