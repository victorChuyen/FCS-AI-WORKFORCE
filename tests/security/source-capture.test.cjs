const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const modulePromise = import('../../scripts/export_deployed_apps_script.mjs');
function fixture() {
  const scriptId = 'script_fixture_12345'; const deploymentId = 'deployment_fixture_12345';
  const deployment = { deploymentId, deploymentConfig: { scriptId, versionNumber: 7 },
    entryPoints: [{ entryPointType: 'WEB_APP' }], updateTime: '2026-09-15T00:00:00Z' };
  const source = { scriptId, files: [
    { name: 'appsscript', type: 'JSON', source: '{"timeZone":"Asia/Ho_Chi_Minh"}' },
    { name: 'Code', type: 'SERVER_JS', source: 'function doGet() { return "fixture"; }' }
  ] };
  const calls = [];
  const responses = [deployment, source, structuredClone(deployment)];
  const options = { scriptId, deploymentId, token: 'fixture-oauth-token-not-valid', fetchImpl: async (url, init) => {
    calls.push({ url, init }); return { ok: true, status: 200, text: async () => JSON.stringify(responses.shift()) };
  } };
  return { options, calls, deployment, source, responses };
}
test('capture uses only authenticated GETs and explicit deployed version, never HEAD', async () => {
  const { captureSource } = await modulePromise; const f = fixture(); const result = await captureSource(f.options);
  assert.equal(result.manifest.versionNumber, 7); assert.equal(result.manifest.files.length, 2);
  assert.match(result.manifest.sourceSha256, /^[a-f0-9]{64}$/);
  assert.equal(f.calls.length, 3);
  assert.equal(f.calls[1].url, 'https://script.googleapis.com/v1/projects/script_fixture_12345/content?versionNumber=7');
  for (const { url, init } of f.calls) {
    assert.equal(init.method, 'GET'); assert.equal(init.redirect, 'error'); assert.equal(init.body, undefined);
    assert.ok(!url.includes(f.options.token)); assert.equal(init.headers.Authorization, 'Bearer ' + f.options.token);
  }
  assert.ok(!JSON.stringify(result).includes(f.options.token));
});
for (const [name, edit, code] of [
  ['mismatched deployment', f => { f.deployment.deploymentId = 'wrong'; }, 'DEPLOYMENT_IDENTITY_MISMATCH'],
  ['mismatched script', f => { f.deployment.deploymentConfig.scriptId = 'wrong'; }, 'DEPLOYMENT_IDENTITY_MISMATCH'],
  ['unversioned deployment', f => { delete f.deployment.deploymentConfig.versionNumber; }, 'PINNED_VERSION_REQUIRED'],
  ['no web app', f => { f.deployment.entryPoints = []; }, 'WEB_APP_REQUIRED'],
  ['wrong source project', f => { f.source.scriptId = 'wrong'; }, 'SOURCE_IDENTITY_MISMATCH'],
  ['duplicate source', f => { f.source.files.push(f.source.files[0]); }, 'DUPLICATE_SOURCE_FILE'],
  ['no manifest', f => { f.source.files.shift(); }, 'MANIFEST_REQUIRED'],
  ['changed deployment', f => { f.responses[2].deploymentConfig.versionNumber = 8; }, 'DEPLOYMENT_CHANGED_DURING_READ'],
  ['changed execution config', f => { f.responses[2].entryPoints[0].webApp = { executeAs: 'USER_ACCESSING' }; }, 'DEPLOYMENT_CHANGED_DURING_READ'],
  ['unsafe script ID', f => { f.options.scriptId = '../other-project'; }, 'INVALID_IDS']
]) {
  test('capture rejects ' + name, async () => {
    const { captureSource } = await modulePromise; const f = fixture(); edit(f);
    await assert.rejects(captureSource(f.options), { message: code });
  });
}
test('provider failure does not log its body or credentials', async () => {
  const { captureSource } = await modulePromise; const f = fixture();
  f.options.fetchImpl = async () => ({ ok: false, status: 403, text: () => { throw new Error('must not read body'); } });
  await assert.rejects(captureSource(f.options), { message: 'GOOGLE_READ_FAILED_HTTP_403' });
});
test('source capture is private and refuses to overwrite an earlier directory', async () => {
  const { captureSource, writeCapture } = await modulePromise; const f = fixture();
  const capture = await captureSource(f.options); const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fcs-capture-'));
  try {
    const out = path.join(root, 'capture'); writeCapture(out, capture);
    assert.equal(JSON.parse(fs.readFileSync(path.join(out, 'manifest.json'))).versionNumber, 7);
    if (process.platform !== 'win32') assert.equal(fs.statSync(path.join(out, 'source.private.json')).mode & 0o777, 0o600);
    assert.throws(() => writeCapture(out, capture), { code: 'EEXIST' });
    assert.equal(JSON.parse(fs.readFileSync(path.join(out, 'source.private.json'))).files.length, 2);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
