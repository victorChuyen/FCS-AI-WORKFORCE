const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Guard = require('../../backend/security/RequestGuard.gs');
const NOW = 2000000000000;
const token = 'fixture-token-not-a-real-credential';
function fixture() {
  const identity = { uid: 'uid-A', sub: 'uid-A', email_verified: true, exp: NOW / 1000 + 3600,
    aud: 'fixture-project', iss: 'https://securetoken.google.com/fixture-project' };
  const state = {
    users: [{ firebase_uid: 'uid-A', status: 'ACTIVE', platform_role: 'NONE' }],
    tenants: [{ tenant_id: 'FCS-000001', status: 'ACTIVE' }, { tenant_id: 'FCS-000002', status: 'ACTIVE' }],
    memberships: [{ firebase_uid: 'uid-A', tenant_id: 'FCS-000001', tenant_role: 'RECRUITER',
      staff_id: 'staff-A', office_scope: ['office-A'], status: 'ACTIVE' }],
    files: [{ tenant_id: 'FCS-000001', data_spreadsheet_id: 'sheet-A', management_spreadsheet_id: 'mgmt-A', status: 'ACTIVE' },
      { tenant_id: 'FCS-000002', data_spreadsheet_id: 'sheet-B', management_spreadsheet_id: 'mgmt-B', status: 'ACTIVE' }]
  };
  // Fixture-only policy, NOT a production RBAC definition.
  const policies = {
    'worker.list': { scope: 'TENANT', roles: ['RECRUITER', 'TENANT_ADMIN'], recordScope: 'OWN' },
    'worker.update': { scope: 'TENANT', roles: ['TENANT_ADMIN'], recordScope: 'OFFICE' },
    'report.export': { scope: 'TENANT', roles: ['TENANT_ADMIN'], recordScope: 'OFFICE' },
    'tenant.list': { scope: 'PLATFORM', roles: ['PLATFORM_SUPER_ADMIN'], recordScope: 'TENANT' },
    'tenant.select': { scope: 'TENANT', roles: ['RECRUITER'], recordScope: 'OFFICE' }
  };
  const calls = [];
  const options = { projectId: 'fixture-project', policies, now: () => NOW,
    verifyToken: t => { calls.push('verify'); assert.equal(t, token); return identity; },
    loadState: uid => { calls.push('registry'); assert.equal(uid, 'uid-A'); return state; } };
  return { identity, state, options, calls, request: { action: 'worker.list', idToken: token,
    requestedTenantId: 'FCS-000001', payload: {}, identity: { email: 'forged-admin@example.invalid', role: 'PLATFORM_SUPER_ADMIN' } } };
}
function denies(edit, code = 'FORBIDDEN', beforeRegistry = false) {
  const f = fixture(); edit(f); const guard = Guard.create(f.options);
  assert.throws(() => guard.authorize(f.request), { code });
  if (beforeRegistry) assert.ok(!f.calls.includes('registry'));
}
test('requires an actual verifier and registry adapter', () => {
  for (const options of [{}, { projectId: 'p' }, { ...fixture().options, verifyToken: null }])
    assert.throws(() => Guard.create(options), { code: 'SECURITY_CONFIG_INVALID' });
});
test('valid request follows verifier then UID registry; forged identity is ignored', () => {
  const f = fixture(); const ctx = Guard.create(f.options).authorize(f.request);
  assert.deepEqual(f.calls, ['verify', 'registry']); assert.equal(ctx.uid, 'uid-A');
  assert.equal(ctx.role, 'RECRUITER'); assert.equal(ctx.tenantId, 'FCS-000001');
  assert.ok(Object.isFrozen(ctx)); assert.ok(Object.isFrozen(ctx.officeIds)); assert.equal(ctx.idToken, undefined);
});
for (const missing of [undefined, '', null, {}, ' ', 'x'.repeat(16385)]) {
  test('invalid token type/length is denied before registry: ' + String(missing).slice(0, 16), () =>
    denies(f => { f.request.idToken = missing; }, 'UNAUTHENTICATED', true));
}
test('verifier rejects token without disclosing its error', () => denies(f => {
  f.options.verifyToken = () => { throw new Error('private-provider-details'); };
}, 'UNAUTHENTICATED', true));
for (const [field, value] of [['uid', ''], ['sub', 'another-uid'], ['aud', 'wrong-project'],
  ['iss', 'https://attacker.invalid/'], ['exp', NOW / 1000], ['exp', '2000003600'], ['email_verified', false]]) {
  test('verified identity sanity check rejects ' + field, () => denies(f => { f.identity[field] = value; }, 'UNAUTHENTICATED', true));
}
test('a Promise from an unadapted async verifier fails closed', () => denies(f => {
  f.options.verifyToken = () => Promise.resolve(f.identity);
}, 'UNAUTHENTICATED', true));
test('unknown actions cannot reach registry', () => denies(f => { f.request.action = 'goldenflow.run'; }, 'ACTION_NOT_ALLOWED', true));
test('prototype action is not an allowlisted action', () => denies(f => { f.request.action = 'toString'; }, 'ACTION_NOT_ALLOWED', true));
test('no default pilot tenant', () => denies(f => { delete f.request.requestedTenantId; }));
test('tenant B request cannot use tenant A membership', () => denies(f => { f.request.requestedTenantId = 'FCS-000002'; }));
test('conflicting payload tenant is rejected', () => denies(f => { f.request.payload.tenant_id = 'FCS-000002'; }));
test('tenant.select validates target membership, not previous tenant', () => denies(f => {
  f.request.action = 'tenant.select'; f.request.payload.tenantId = 'FCS-000002';
}));
for (const table of ['users', 'tenants', 'memberships', 'files']) {
  test('inactive ' + table + ' is denied', () => denies(f => { f.state[table][0].status = 'SUSPENDED'; }));
  test('duplicate ' + table + ' is denied', () => denies(f => { f.state[table].push({ ...f.state[table][0] }); }));
}
test('email-only membership never substitutes for UID', () => denies(f => {
  delete f.state.memberships[0].firebase_uid; f.state.memberships[0].email = 'forged-admin@example.invalid';
}));
test('role from token/client never elevates registry role', () => denies(f => {
  f.request.action = 'worker.update'; f.identity.role = 'TENANT_ADMIN';
}));
test('unconfigured office scope is not wildcard', () => denies(f => { f.state.memberships[0].office_scope = []; }));
test('raw string office scope requires explicit adapter', () => denies(f => { f.state.memberships[0].office_scope = '*'; }, 'SECURITY_CONFIG_INVALID'));
test('cross-tenant shared file mapping is blocked', () => denies(f => {
  f.state.files[1].data_spreadsheet_id = 'sheet-A';
}, 'SECURITY_CONFIG_INVALID'));
test('server state errors do not disclose private details', () => denies(f => {
  f.options.loadState = () => { throw new Error('private-sheet-details'); };
}, 'SECURITY_STATE_UNAVAILABLE'));
test('platform action requires active platform role from registry', () => {
  const f = fixture(); f.request.action = 'tenant.list'; const guard = Guard.create(f.options);
  assert.throws(() => guard.authorize(f.request), { code: 'FORBIDDEN' });
  f.state.users[0].platform_role = 'PLATFORM_SUPER_ADMIN';
  const ctx = guard.authorize(f.request); assert.equal(ctx.scope, 'PLATFORM');
  assert.throws(() => guard.assertRecord(ctx, { tenantId: 'FCS-000001', spreadsheetId: 'sheet-A' }, {}), { code: 'FORBIDDEN' });
});
test('record filtering isolates sheet, tenant, office and recruiter before aggregation/export', () => {
  const f = fixture(); const guard = Guard.create(f.options); const ctx = guard.authorize(f.request);
  const binding = { tenantId: 'FCS-000001', spreadsheetId: 'sheet-A' };
  const valid = { worker_id: 'WK-A', office_id: 'office-A', recruiter_id: 'staff-A' };
  const rows = [valid, { ...valid, tenant_id: 'FCS-000002' }, { ...valid, office_id: 'office-B' },
    { ...valid, recruiter_id: 'staff-B' }, { worker_id: 'WK-MISSING' }];
  assert.deepEqual(guard.filterRecords(ctx, binding, rows), [valid]);
  for (const bad of rows.slice(1)) assert.throws(() => guard.assertRecord(ctx, binding, bad), { code: 'FORBIDDEN' });
  assert.throws(() => guard.filterRecords(ctx, { ...binding, spreadsheetId: 'sheet-B' }, rows), { code: 'FORBIDDEN' });
  assert.throws(() => guard.filterRecords({ ...ctx }, binding, rows), { code: 'FORBIDDEN' });
  guard.assertRecord(ctx, binding, valid);
});
test('export does not inherit more office access than list', () => {
  const f = fixture(); f.request.action = 'report.export'; f.state.memberships[0].tenant_role = 'TENANT_ADMIN';
  const guard = Guard.create(f.options); const ctx = guard.authorize(f.request);
  assert.deepEqual(guard.filterRecords(ctx, { tenantId: ctx.tenantId, spreadsheetId: 'sheet-A' },
    [{ office_id: 'office-B' }, { office_id: 'office-A' }]), [{ office_id: 'office-A' }]);
});
test('expired context and foreign guard context cannot be reused', () => {
  const f = fixture(); let time = NOW; f.options.now = () => time;
  const guard = Guard.create(f.options); const ctx = guard.authorize(f.request);
  const binding = { tenantId: ctx.tenantId, spreadsheetId: 'sheet-A' };
  const row = { office_id: 'office-A', recruiter_id: 'staff-A' };
  assert.throws(() => Guard.create(f.options).assertRecord(ctx, binding, row), { code: 'FORBIDDEN' });
  time += 3600000; assert.throws(() => guard.assertRecord(ctx, binding, row), { code: 'FORBIDDEN' });
});
test('policy cannot be changed by mutating the supplied object later', () => {
  const f = fixture(); const guard = Guard.create(f.options);
  f.options.policies['worker.update'].roles.push('RECRUITER'); f.request.action = 'worker.update';
  assert.throws(() => guard.authorize(f.request), { code: 'FORBIDDEN' });
});
// Paired request-envelope test. This executes the real PR client through a fake SDK
// and network into the candidate guard. It is NOT a live Firebase/Apps Script test.
test('PR frontend request envelope reaches guard with authenticated UID, not forged metadata', async () => {
  const ts = require('typescript');
  const file = path.join(__dirname, '../../src/services/apiClient.ts');
  const source = fs.readFileSync(file, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const f = fixture(); const guard = Guard.create(f.options);
  const user = { uid: 'uid-A', tenantId: 'FCS-000001', role: 'RECRUITER', emailVerified: true, staffId: 'staff-A', isSuperAdmin: false };
  const sandbox = { exports: {}, URL, Date, Math,
    require: p => p === '../config/env' ? { API_BASE_URL: 'https://script.google.com/macros/s/fixture/exec' } :
      p === './auth' ? { getAuthenticatedSession: async () => ({ user, token }), getCurrentUser: () => user } : {},
    fetch: async (_url, init) => {
      const request = JSON.parse(init.body); const ctx = guard.authorize(request);
      assert.equal(request.idToken, token); assert.equal(ctx.role, 'RECRUITER');
      return { ok: true, json: async () => ({ success: true, data: { tenantId: ctx.tenantId }, requestId: request.requestId }) };
    }
  };
  vm.runInNewContext(compiled, sandbox);
  sandbox.exports.setApiUserMetadata({ email: 'fake-admin@example.invalid', role: 'PLATFORM_SUPER_ADMIN', tenantId: 'FCS-000001' });
  const result = await sandbox.exports.callApi('worker.list', {});
  assert.equal(result.success, true); assert.equal(result.data.tenantId, 'FCS-000001');
});
