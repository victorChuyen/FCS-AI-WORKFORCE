// Offline behavioral checks. SDK, React hooks and network are doubles, not live QA.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
function storage() {
  const entries = new Map();
  return { getItem: k => entries.get(k) ?? null, setItem: (k, v) => entries.set(k, String(v)), removeItem: k => entries.delete(k) };
}
function load(file, dependencies, globals = {}, env = { DEV: false, PROD: true }) {
  const text = source(file).replaceAll('import.meta.env', JSON.stringify(env));
  const compiled = ts.transpileModule(text, {
    fileName: file, reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  });
  assert.deepEqual((compiled.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error), []);
  const module = { exports: {} };
  vm.runInNewContext(compiled.outputText, {
    exports: module.exports, module, console, Date, URL, URLSearchParams, setTimeout: () => 0,
    fetch: () => { throw new Error('UNEXPECTED_NETWORK'); },
    require: name => {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected import ${name} in ${file}`);
    }, ...globals,
  }, { filename: file, timeout: 2000 });
  return module.exports;
}
const claims = { role: 'RECRUITER', tenantId: 'FCS-000001' };
const tokenResult = (c = claims) => ({ claims: c, token: 'sdk-token', expirationTime: new Date(Date.now() + 3600000).toISOString() });
function firebaseUser(c = claims, extra = {}) {
  return { uid: 'real-uid', email: 'operator@example.test', displayName: 'Operator', emailVerified: true,
    getIdTokenResult: async () => tokenResult(c), reload: async () => {}, ...extra };
}
function authHarness({ configured = true, user = firebaseUser(), sdk = {}, localStorage = storage() } = {}) {
  const auth = { currentUser: user };
  const firebase = {
    signInWithEmailAndPassword: async () => ({ user }), signInWithPopup: async () => ({ user }),
    createUserWithEmailAndPassword: async () => ({ user }), signOut: async () => { auth.currentUser = null; },
    updateProfile: async () => {}, sendPasswordResetEmail: async () => {}, sendEmailVerification: async () => {}, ...sdk,
  };
  return { auth, localStorage, user, service: load('src/services/auth.ts', {
    'firebase/auth': firebase, './firebase': { auth, googleProvider: {}, isFirebaseConfigured: () => configured },
  }, { window: { localStorage } }) };
}
for (const method of ['signInWithEmail', 'signInWithGoogle', 'signUpWithEmail', 'getIdToken']) {
  test(`missing configuration rejects ${method}`, async () => {
    const h = authHarness({ configured: false });
    await assert.rejects(() => h.service[method]('member@example.test', 'test-input', 'Name'), { code: 'auth/configuration-missing' });
    assert.equal(h.service.getCurrentUser(), null);
  });
}
test('legacy browser profile never restores identity', () => {
  const h = authHarness(); h.localStorage.setItem('fcs_active_user', '{"role":"PLATFORM_SUPER_ADMIN"}');
  assert.equal(h.service.getStoredUser(), null); assert.equal(h.localStorage.getItem('fcs_active_user'), null);
  h.service.saveStoredUser({ uid: h.user.uid, role: 'PLATFORM_SUPER_ADMIN' }); assert.equal(h.service.getCurrentUser(), null);
});
test('blocked storage never authenticates', () => {
  assert.equal(authHarness({ localStorage: { removeItem() { throw new Error('blocked'); } } }).service.getStoredUser(), null);
});
test('formerly preset email with wrong password is denied', async () => {
  const h = authHarness({ sdk: { signInWithEmailAndPassword: async () => { throw Object.assign(new Error('denied'), { code: 'auth/invalid-credential' }); } } });
  await assert.rejects(() => h.service.signInWithEmail('coach.chuyen@gmail.com', 'wrong-input'), { code: 'auth/invalid-credential' });
  assert.equal(h.service.getCurrentUser(), null); assert.deepEqual(plain(h.service.PRESET_ACCOUNTS), {});
});
test('email alone cannot authenticate', async () => {
  await assert.rejects(() => authHarness().service.signInWithEmail('coach.chuyen@gmail.com'), { code: 'auth/credentials-required' });
});
for (const code of ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/network-request-failed']) {
  test(`Google failure ${code} never returns an administrator`, async () => {
    const h = authHarness({ sdk: { signInWithPopup: async () => { throw Object.assign(new Error(code), { code }); } } });
    await assert.rejects(() => h.service.signInWithGoogle(), { code }); assert.equal(h.service.getCurrentUser(), null);
  });
}
for (const email of ['admin@example.test', 'manager-fcs@breaths.live', 'coach.chuyen@gmail.com']) {
  test(`email ${email} does not grant membership`, () => {
    assert.throws(() => authHarness().service.mapFirebaseUser(firebaseUser({}, { email })), { code: 'auth/access-not-provisioned' });
  });
}
for (const c of [{ role: 'ADMIN', tenantId: 'FCS-000001' }, { role: 'RECRUITER' }, { role: 'RECRUITER', tenantId: '*' }, { role: 'RECRUITER', tenantId: 'FCS-1' }]) {
  test(`invalid membership fails closed: ${JSON.stringify(c)}`, () => {
    assert.throws(() => authHarness().service.mapFirebaseUser(firebaseUser(), c), { code: 'auth/access-not-provisioned' });
  });
}
test('SDK claims preserve UID, role, tenant and scope', async () => {
  const h = authHarness({ user: firebaseUser({ role: 'TENANT_MANAGER', tenantId: 'FCS-000002', allowedOfficeIds: ['OFF-02'] }) });
  const user = await h.service.signInWithEmail('member@example.test', 'user-input');
  assert.equal(user.uid, h.user.uid); assert.equal(user.tenantId, 'FCS-000002'); assert.equal(user.role, 'TENANT_MANAGER');
  assert.equal(user.isSuperAdmin, false); assert.deepEqual(plain(user.allowedOfficeIds), ['OFF-02']);
  assert.equal(h.localStorage.getItem('fcs_active_user'), null);
});
test('legacy TENANT_VIEWER maps to read-only VIEWER', () => {
  assert.equal(authHarness().service.mapFirebaseUser(firebaseUser(), { role: 'TENANT_VIEWER', tenantId: 'FCS-000001' }).role, 'VIEWER');
});
test('email verification and office scope are not fabricated', () => {
  const user = authHarness().service.mapFirebaseUser(firebaseUser({}, { emailVerified: false, email: 'admin-fcs@breaths.live' }), { role: 'TENANT_ADMIN', tenantId: 'FCS-000001' });
  assert.equal(user.emailVerified, false); assert.deepEqual(plain(user.allowedOfficeIds), []);
});
test('registration creates no tenant membership', async () => {
  const h = authHarness(); const result = await h.service.signUpWithEmail('new@example.test', 'user-input', 'Name');
  assert.equal(result.user.tenantId, undefined); assert.equal(result.user.isSuperAdmin, false); assert.equal(h.service.getCurrentUser(), null);
});
test('expired token result is refused', async () => {
  const h = authHarness({ user: firebaseUser({}, { getIdTokenResult: async () => ({ ...tokenResult(), expirationTime: '2000-01-01T00:00:00Z' }) }) });
  await assert.rejects(() => h.service.resolveFirebaseUser(h.user), { code: 'auth/unauthenticated' });
});
test('pending token cannot resurrect logout', async () => {
  const d = deferred(); const h = authHarness({ user: firebaseUser({}, { getIdTokenResult: () => d.promise }) });
  const pending = h.service.resolveFirebaseUser(h.user); await h.service.logout(); d.resolve(tokenResult());
  await assert.rejects(() => pending, { code: 'auth/session-changed' }); assert.equal(h.service.getCurrentUser(), null);
});
test('no SDK user means no mock bearer', async () => {
  await assert.rejects(() => authHarness({ user: null }).service.getIdToken(), { code: 'auth/unauthenticated' });
});
test('unverified SDK user cannot get a business token', async () => {
  await assert.rejects(() => authHarness({ user: firebaseUser({}, { emailVerified: false }) }).service.getIdToken(), { code: 'auth/email-not-verified' });
});
test('failed SDK logout still blocks local token access', async () => {
  const h = authHarness({ sdk: { signOut: async () => { throw new Error('offline'); } } });
  await h.service.resolveFirebaseUser(h.user); await assert.rejects(() => h.service.logout());
  assert.equal(h.service.getCurrentUser(), null);
  await assert.rejects(() => h.service.getAuthenticatedSession(), { code: 'auth/unauthenticated' });
});
test('API session refresh uses the latest claims rather than cached UI role', async () => {
  let c = { role: 'TENANT_ADMIN', tenantId: 'FCS-000001' };
  const h = authHarness({ user: firebaseUser({}, { getIdTokenResult: async () => tokenResult(c) }) });
  await h.service.resolveFirebaseUser(h.user); c = { role: 'VIEWER', tenantId: 'FCS-000001' };
  assert.equal((await h.service.getAuthenticatedSession()).user.role, 'VIEWER');
});
function apiHarness({ token = 'sdk-token', user = { uid: 'actual-uid', email: 'member@example.test', role: 'RECRUITER', tenantId: 'FCS-000001', emailVerified: true, isSuperAdmin: false }, url = 'https://script.google.com/macros/s/test-only/exec', tokenError = false, response = { success: true, data: [] } } = {}) {
  const calls = []; let currentUser = user; let responder = async () => response;
  const api = load('src/services/apiClient.ts', {
    '../config/env': { API_BASE_URL: url },
    './auth': { getAuthenticatedSession: async () => { if (tokenError) throw new Error('denied'); return { token, user }; }, getCurrentUser: () => currentUser },
  }, { fetch: async (target, options) => { calls.push({ target, options }); return { ok: true, json: () => responder() }; } });
  return { api, calls, clearUser: () => { currentUser = null; }, setResponder: fn => { responder = fn; } };
}
for (const options of [{ tokenError: true }, { token: null }, { user: null }]) {
  test(`API blocks missing auth before fetch: ${JSON.stringify(options)}`, async () => {
    const h = apiHarness(options); assert.equal((await h.api.callApi('worker.list')).error.code, 'UNAUTHENTICATED'); assert.equal(h.calls.length, 0);
  });
}
test('body identity cannot come from manipulated metadata', async () => {
  const h = apiHarness(); h.api.setApiUserMetadata({ email: 'fake@example.test', role: 'PLATFORM_SUPER_ADMIN', firebaseUid: 'fake' });
  await h.api.callApi('worker.list'); const b = JSON.parse(h.calls[0].options.body);
  assert.equal(b.identity.firebaseUid, 'actual-uid'); assert.equal(b.identity.role, 'RECRUITER'); assert.equal(b.identity.email, 'member@example.test');
});
test('cross-tenant hint denied locally', async () => {
  const h = apiHarness(); h.api.setApiUserMetadata({ tenantId: 'FCS-000002' });
  assert.equal((await h.api.callApi('worker.list')).error.code, 'FORBIDDEN'); assert.equal(h.calls.length, 0);
});
test('non-admin cannot select tenant', async () => {
  const h = apiHarness(); assert.equal((await h.api.callApi('tenant.select', { tenantId: 'FCS-000002' })).error.code, 'FORBIDDEN'); assert.equal(h.calls.length, 0);
});
test('Apps Script token in POST body, not query/header', async () => {
  const h = apiHarness(); await h.api.callApi('worker.list');
  assert.equal(JSON.parse(h.calls[0].options.body).idToken, 'sdk-token'); assert.equal(h.calls[0].options.headers.Authorization, undefined);
  assert.equal(h.calls[0].target.includes('sdk-token'), false);
});
test('HTTPS gateway uses bearer header', async () => {
  const h = apiHarness({ url: 'https://gateway.example.test/api' }); await h.api.callApi('worker.list'); assert.equal(h.calls[0].options.headers.Authorization, 'Bearer sdk-token');
});
test('HTTP blocked before transmitting token', async () => {
  const h = apiHarness({ url: 'http://gateway.example.test/api' }); assert.equal((await h.api.callApi('worker.list')).error.code, 'INSECURE_API_URL'); assert.equal(h.calls.length, 0);
});
test('string API success is rejected', async () => {
  const h = apiHarness({ response: { success: 'false' } }); assert.equal((await h.api.callApi('worker.list')).error.code, 'INVALID_RESPONSE');
});
test('API error response cannot carry usable data', async () => {
  const h = apiHarness({ response: { success: false, data: { unexpected: true }, error: { code: 'FORBIDDEN' } } }); assert.equal((await h.api.callApi('worker.list')).data, null);
});
for (const changed of ['user', 'tenant']) {
  test(`pending response discarded after ${changed} changes`, async () => {
    const d = deferred(); const entered = deferred(); const h = apiHarness();
    h.setResponder(() => { entered.resolve(); return d.promise; }); const pending = h.api.callApi('worker.list'); await entered.promise;
    if (changed === 'user') h.clearUser(); else h.api.setApiUserMetadata({ tenantId: 'FCS-000002' });
    d.resolve({ success: true, data: ['private'] }); const response = await pending;
    assert.equal(response.error.code, 'SESSION_CHANGED'); assert.equal(response.data, null);
  });
}
for (const dev of [false, true]) {
  test(`${dev ? 'dev' : 'production'} mock boundary`, () => {
    const s = storage(); s.setItem('fcs_use_mock_api', 'true');
    const m = load('src/services/api.ts', {
      '../config/env': { USE_MOCK_API: true, API_BASE_URL: '' }, './mockApi': { mockApiService: { probe: () => 'mock' } }, './realApi': { realApi: { probe: () => 'real' } },
    }, { window: { localStorage: s } }, { DEV: dev, PROD: !dev });
    assert.equal(m.isUsingMockApi(), dev); assert.equal(m.api.probe(), dev ? 'mock' : 'real');
    if (!dev) assert.throws(() => m.setUsingMockApi(true), /MOCK_API_DISABLED/);
  });
}
function reactHarness() {
  let cursor = 0; const slots = []; const pending = [];
  const React = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    createContext: initial => ({ Provider: 'Provider', value: initial }), useContext: context => context.value,
    useState(initial) { const i = cursor++; if (!Object.hasOwn(slots, i)) slots[i] = typeof initial === 'function' ? initial() : initial;
      return [slots[i], v => { slots[i] = typeof v === 'function' ? v(slots[i]) : v; }]; },
    useRef(initial) { const i = cursor++; if (!Object.hasOwn(slots, i)) slots[i] = { current: initial }; return slots[i]; },
    useMemo: fn => fn(), useCallback: fn => fn,
    useEffect(fn, deps) { const i = cursor++;
      if (!slots[i] || !deps || deps.some((v, k) => v !== slots[i].deps[k])) {
        slots[i]?.cleanup?.(); slots[i] = { deps }; pending.push(() => { slots[i].cleanup = fn(); });
      }
    },
  };
  return { React, render(C) { cursor = 0; return C({ children: 'child' }); }, flush() { while (pending.length) pending.shift()(); } };
}
function providerHarness(resolve) {
  const r = reactHarness(); let listener; let clearCount = 0;
  const { AuthProvider } = load('src/auth/AuthProvider.tsx', {
    react: r.React, 'firebase/auth': { onIdTokenChanged: (_auth, cb) => { listener = cb; return () => {}; } },
    '../services/firebase': { auth: {}, isFirebaseConfigured: () => true, getMissingFirebaseEnvVars: () => [] },
    '../services/auth': { resolveFirebaseUser: resolve, saveStoredUser: () => { clearCount++; }, logout: async () => {}, reloadCurrentUser: async () => null, sendVerificationEmail: async () => {} },
  });
  return { r, render: () => r.render(AuthProvider).props.value, emit: user => listener(user), clears: () => clearCount };
}
test('provider starts closed, resolves SDK, then clears null event', async () => {
  const h = providerHarness(async () => ({ uid: 'u', tenantId: 'FCS-000001' }));
  assert.equal(h.render().isAuthenticated, false); h.r.flush();
  await h.emit({ uid: 'u' }); assert.equal(h.render().isAuthenticated, true);
  await h.emit(null); assert.equal(h.render().user, null);
  await assert.rejects(() => h.render().loginWithPreset('anything'), { code: 'auth/credentials-required' });
});
test('provider ignores stale resolution after null event', async () => {
  const d = deferred(); const h = providerHarness(() => d.promise); h.render(); h.r.flush();
  const old = h.emit({ uid: 'u' }); await h.emit(null); d.resolve({ uid: 'u', tenantId: 'FCS-000001' }); await old;
  assert.equal(h.render().user, null);
});
test('ordinary token refresh does not trigger a synthetic logout', async () => {
  const h = providerHarness(async () => ({ uid: 'u', tenantId: 'FCS-000001' })); h.render(); h.r.flush(); const count = h.clears();
  await h.emit({ uid: 'u' }); await h.emit({ uid: 'u' }); assert.equal(h.clears(), count); assert.equal(h.render().isAuthenticated, true);
});
test('unverified admin must still verify email', () => {
  const r = reactHarness(); function Verification() {}
  const { ProtectedRoute } = load('src/auth/ProtectedRoute.tsx', {
    react: r.React, './AuthProvider': { useAuth: () => ({ user: { tenantId: 'FCS-000001', isSuperAdmin: true, emailVerified: false }, loading: false, isAuthenticated: true }) },
    '../pages/auth/EmailVerificationScreen': { EmailVerificationScreen: Verification },
  }); assert.equal(r.render(ProtectedRoute).type, Verification);
});
test('signed-out AppContext is neutral and sends no business calls', () => {
  const r = reactHarness(); let calls = 0;
  const { AppProvider } = load('src/context/AppContext.tsx', {
    react: r.React, '../auth/AuthProvider': { useAuth: () => ({ user: null, loading: false }) }, '../services/apiClient': { setApiUserMetadata: () => {} },
    '../services/api': { isUsingMockApi: () => false, setUsingMockApi: () => { calls++; }, realApi: { checkHealth: () => { calls++; }, listTenants: () => { calls++; } } },
  }, { window: { location: { pathname: '/', search: '' }, addEventListener() {}, removeEventListener() {} } });
  const v = r.render(AppProvider).props.value; r.flush(); assert.equal(v.currentUser.role, 'VIEWER'); assert.equal(v.currentUser.isSuperAdmin, false);
  assert.equal(v.tenantContext.tenantId, ''); assert.deepEqual(plain(v.availableTenants), []); v.toggleMockMode(true); assert.equal(calls, 0);
});
test('retired seeder has no credential writes and exits nonzero', () => {
  const file = 'scripts/seed_firebase_users.mjs'; const r = spawnSync(process.execPath, [path.join(root, file)], { encoding: 'utf8' });
  assert.equal(r.status, 1); assert.match(r.stderr, /FCS_PROVISIONING_DISABLED/); assert.doesNotMatch(source(file), /updateUser\(|password\s*:/);
});
test('login contains no preset bypass or password prefill', () => {
  const text = source('src/pages/auth/LoginPage.tsx'); assert.doesNotMatch(text, /handle1ClickLogin|pilotAccounts|loginWithPreset|setPassword\(['"][^'"]+/);
  assert.match(text, /autoComplete="current-password"/);
});
for (const file of ['src/auth/AuthProvider.tsx', 'src/auth/ProtectedRoute.tsx', 'src/context/AppContext.tsx', 'src/pages/auth/LoginPage.tsx', 'src/services/auth.ts', 'src/services/api.ts', 'src/services/apiClient.ts']) {
  test(`syntax transpilation: ${file}`, () => {
    const result = ts.transpileModule(source(file), { fileName: file, reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
    assert.deepEqual((result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error), []);
  });
}
