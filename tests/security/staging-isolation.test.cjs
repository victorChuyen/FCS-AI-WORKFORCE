const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const imported = import(pathToFileURL(path.resolve(__dirname, '../../scripts/check_staging_isolation.mjs')).href);
function source(label) { return {
  scriptId: `${label}_script_id_12345`, deploymentId: `${label}_deployment_id_12345`,
  endpoint: `https://script.google.com/macros/s/${label}_deployment_id_12345/exec`,
  versionNumber: 7, sourceSha256: (label === 'prod' ? 'a' : 'b').repeat(64),
}; }
function inventory() { return {
  productionSourceSha256: 'a'.repeat(64), stagingSourceSha256: 'b'.repeat(64),
  productionEndpoint: source('prod').endpoint, stagingEndpoint: source('stage').endpoint,
  scriptPropertiesReviewed: true, allDataResourcesListed: true,
  productionSpreadsheetIds: ['production_registry_123', 'production_data_123'],
  stagingSpreadsheetIds: ['staging_registry_456', 'staging_data_456'],
  frontendCommit: 'c'.repeat(40), stagingFrontendUrl: 'https://isolated-preview.example.test/',
  reviewedBy: 'OFFLINE_FIXTURE_NOT_A_REAL_APPROVAL', reviewedAtUtc: '2026-09-15T00:00:00Z',
}; }
test('valid supplied inventory reports only manifest validity, not live security', async () => {
  const { validateStagingIsolation } = await imported;
  const result = validateStagingIsolation(source('prod'), source('stage'), inventory());
  assert.equal(result.status, 'ISOLATION_MANIFEST_VALID_NOT_LIVE_TESTED');
  assert.equal(result.limitations.length, 5);
});
test('second deployment in same Apps Script project is NOT isolation', async () => {
  const { validateStagingIsolation } = await imported;
  const staging = source('stage'); staging.scriptId = source('prod').scriptId;
  assert.throws(() => validateStagingIsolation(source('prod'), staging, inventory()), /STAGING_NEEDS_SEPARATE_SCRIPT_PROJECT/);
});
test('same production endpoint with another script id is denied', async () => {
  const { validateStagingIsolation } = await imported;
  const stage = { ...source('prod'), scriptId: 'other_script_id_12345' };
  assert.throws(() => validateStagingIsolation(source('prod'), stage, inventory()), /STAGING_ENDPOINT_EQUALS_PRODUCTION/);
});
for (const [key, value, error] of [
  ['scriptPropertiesReviewed', false, 'HUMAN_RESOURCE_INVENTORY_REVIEW_REQUIRED'],
  ['allDataResourcesListed', false, 'HUMAN_RESOURCE_INVENTORY_REVIEW_REQUIRED'],
  ['productionSourceSha256', 'x', 'SOURCE_DIGEST_MISMATCH'],
  ['stagingSourceSha256', 'a'.repeat(64), 'SOURCE_DIGEST_MISMATCH'],
  ['productionSpreadsheetIds', [], 'COMPLETE_UNIQUE_SPREADSHEET_IDS_REQUIRED'],
  ['stagingSpreadsheetIds', ['production_registry_123'], 'STAGING_SHARES_PRODUCTION_SPREADSHEET'],
  ['stagingSpreadsheetIds', ['staging_data_456', 'staging_data_456'], 'COMPLETE_UNIQUE_SPREADSHEET_IDS_REQUIRED'],
  ['stagingSpreadsheetIds', ['https://not-an-id'], 'COMPLETE_UNIQUE_SPREADSHEET_IDS_REQUIRED'],
  ['stagingFrontendUrl', 'https://fcs.breaths.live/', 'INVALID_STAGING_FRONTEND_URL'],
  ['stagingFrontendUrl', 'https://fcs-ai-workforce.pages.dev/', 'INVALID_STAGING_FRONTEND_URL'],
  ['stagingFrontendUrl', 'http://stage.example.test/', 'INVALID_STAGING_FRONTEND_URL'],
  ['stagingFrontendUrl', 'https://x:y@stage.example.test/', 'INVALID_STAGING_FRONTEND_URL'],
  ['stagingFrontendUrl', 'https://stage.example.test/?token=not-real', 'INVALID_STAGING_FRONTEND_URL'],
  ['stagingFrontendUrl', 'https://127.0.0.1/', 'INVALID_STAGING_FRONTEND_URL'],
  ['stagingEndpoint', source('prod').endpoint, 'INVALID_BACKEND_ENDPOINT'],
  ['frontendCommit', 'main', 'FRONTEND_COMMIT_REQUIRED'],
  ['reviewedBy', '', 'INVENTORY_REVIEW_ATTRIBUTION_REQUIRED'],
  ['reviewedAtUtc', 'not-a-date', 'INVENTORY_REVIEW_ATTRIBUTION_REQUIRED'],
]) {
  test(`rejects invalid isolation evidence: ${key} / ${error} / ${String(value)}`, async () => {
    const { validateStagingIsolation } = await imported;
    assert.throws(() => validateStagingIsolation(source('prod'), source('stage'), { ...inventory(), [key]: value }), new RegExp(error));
  });
}

function captureFixture() {
  const hash = value => crypto.createHash('sha256').update(value).digest('hex');
  const files = [
    { name: 'Code', type: 'SERVER_JS', source: '// OFFLINE FIXTURE ONLY\r\n' },
    { name: 'appsscript', type: 'JSON', source: '{"runtimeVersion":"V8"}\n' },
  ].map(file => ({ ...file, sha256: hash(file.source) }));
  const entries = files.map(({ name, type, sha256 }) => ({ name, type, sha256 }));
  return {
    manifest: { ...source('prod'), files: entries, sourceSha256: hash(JSON.stringify(entries.map(f => [f.name, f.type, f.sha256]).sort())) },
    source: { scriptId: source('prod').scriptId, versionNumber: 7, files },
  };
}
async function tempCapture(fn) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'fcs-staging-'));
  const fixture = captureFixture();
  try {
    await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify(fixture.manifest));
    await fs.writeFile(path.join(root, 'source.private.json'), JSON.stringify(fixture.source));
    await fn(root, fixture);
  } finally { await fs.rm(root, { force: true, recursive: true }); }
}
test('accepts the existing source-capture file format with exact byte hashes', async () => {
  const { verifySourceCapture } = await imported;
  await tempCapture(async (root, fixture) => {
    assert.equal((await verifySourceCapture(root)).sourceSha256, fixture.manifest.sourceSha256);
  });
});
for (const kind of ['source-bytes', 'manifest-hash', 'wrong-version', 'missing-app-manifest']) {
  test(`rejects inconsistent private capture: ${kind}`, async () => {
    const { verifySourceCapture } = await imported;
    await tempCapture(async (root, fixture) => {
      if (kind === 'source-bytes') fixture.source.files[0].source += 'tampered';
      if (kind === 'manifest-hash') fixture.manifest.sourceSha256 = 'f'.repeat(64);
      if (kind === 'wrong-version') fixture.source.versionNumber = 8;
      if (kind === 'missing-app-manifest') fixture.source.files.pop();
      await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify(fixture.manifest));
      await fs.writeFile(path.join(root, 'source.private.json'), JSON.stringify(fixture.source));
      await assert.rejects(verifySourceCapture(root));
    });
  });
}
test('rejects symlink source capture instead of reading through it', async () => {
  const { verifySourceCapture } = await imported;
  await tempCapture(async root => {
    await fs.unlink(path.join(root, 'source.private.json'));
    await fs.symlink(path.join(root, 'manifest.json'), path.join(root, 'source.private.json'));
    await assert.rejects(verifySourceCapture(root), /INVALID_CAPTURE_FILE/);
  });
});
