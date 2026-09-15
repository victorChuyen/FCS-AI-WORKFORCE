/**
 * FCS-P1-009B: integration candidate, NOT installed in the production router.
 * Synchronous Apps Script policy boundary. No setup, Sheet writes or default roles.
 * verifyToken MUST be a server-owned cryptographic/Google token verifier checking
 * signature, issuer, audience, expiry, revocation and disabled-user status.
 * Never pass decoded-only JWTs or request.identity as its result.
 * loadState MUST read the real UID-based registry, not client claims or payload.
 * No verifier or schema adapter is provided until the deployed source is verified.
 */
var FcsRequestGuard = (function () {
  'use strict';
  function fail(code) { var error = new Error(code); error.code = code; throw error; }
  function text(value) { return typeof value === 'string' && value.trim() === value && value.length > 0; }
  function own(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); }
  function one(rows, predicate) {
    if (!Array.isArray(rows)) fail('SECURITY_CONFIG_INVALID');
    var matches = rows.filter(predicate);
    if (matches.length !== 1) fail('FORBIDDEN');
    return matches[0];
  }
  function create(options) {
    if (!options || !text(options.projectId) || typeof options.verifyToken !== 'function' ||
        typeof options.loadState !== 'function' || !options.policies) fail('SECURITY_CONFIG_INVALID');
    var projectId = options.projectId;
    // Copy server-owned policy; never retain mutable caller/request objects.
    var policies = JSON.parse(JSON.stringify(options.policies));
    var contexts = new WeakSet();
    var now = options.now || function () { return Date.now(); };
    function authorize(request) {
      if (!request || typeof request !== 'object' || Array.isArray(request) ||
          !text(request.action) || !own(policies, request.action)) fail('ACTION_NOT_ALLOWED');
      var rule = policies[request.action];
      if (!rule || !['TENANT', 'PLATFORM'].includes(rule.scope) ||
          !Array.isArray(rule.roles) || rule.roles.length === 0 ||
          !['TENANT', 'OFFICE', 'OWN'].includes(rule.recordScope)) fail('SECURITY_CONFIG_INVALID');
      if (!text(request.idToken) || request.idToken.length > 16384) fail('UNAUTHENTICATED');
      var identity;
      try { identity = options.verifyToken(request.idToken); }
      catch (_) { fail('UNAUTHENTICATED'); }
      // Defense-in-depth only. This is NOT signature/revocation verification.
      if (!identity || !text(identity.uid) || identity.uid.length > 128 || identity.sub !== identity.uid ||
          identity.aud !== projectId || identity.iss !== 'https://securetoken.google.com/' + projectId ||
          !Number.isSafeInteger(identity.exp) || identity.exp <= Math.floor(now() / 1000) ||
          identity.email_verified !== true) fail('UNAUTHENTICATED');
      var state;
      try { state = options.loadState(identity.uid); }
      catch (_) { fail('SECURITY_STATE_UNAVAILABLE'); }
      if (!state || typeof state !== 'object') fail('SECURITY_CONFIG_INVALID');
      var user = one(state.users, function (r) { return r.firebase_uid === identity.uid; });
      if (user.status !== 'ACTIVE') fail('FORBIDDEN');
      var ctx = { uid: identity.uid, action: request.action, scope: rule.scope,
        recordScope: rule.recordScope, expiresAt: identity.exp * 1000 };
      if (rule.scope === 'PLATFORM') {
        if (user.platform_role !== 'PLATFORM_SUPER_ADMIN' || !rule.roles.includes(user.platform_role)) fail('FORBIDDEN');
        ctx.role = user.platform_role;
      } else {
        var payload = request.payload || {};
        if (typeof payload !== 'object' || Array.isArray(payload)) fail('BAD_REQUEST');
        var tenantId = request.action === 'tenant.select' ? payload.tenantId : request.requestedTenantId;
        if (!text(tenantId) || !/^FCS-\d{6}$/.test(tenantId)) fail('FORBIDDEN');
        if ((own(payload, 'tenant_id') && payload.tenant_id !== tenantId) ||
            (own(payload, 'tenantId') && payload.tenantId !== tenantId)) fail('FORBIDDEN');
        var tenant = one(state.tenants, function (r) { return r.tenant_id === tenantId; });
        var access = one(state.memberships, function (r) {
          return r.firebase_uid === identity.uid && r.tenant_id === tenantId;
        });
        if (tenant.status !== 'ACTIVE' || access.status !== 'ACTIVE') fail('FORBIDDEN');
        var role = access.tenant_role === 'TENANT_VIEWER' ? 'VIEWER' : access.tenant_role;
        if (!rule.roles.includes(role)) fail('FORBIDDEN');
        var offices = access.office_scope;
        if (!Array.isArray(offices) || !offices.every(text)) fail('SECURITY_CONFIG_INVALID');
        if (rule.recordScope !== 'TENANT' && offices.length === 0) fail('FORBIDDEN');
        if (rule.recordScope === 'OWN' && !text(access.staff_id)) fail('FORBIDDEN');
        var binding = one(state.files, function (r) { return r.tenant_id === tenantId; });
        if (binding.status !== 'ACTIVE' || !text(binding.data_spreadsheet_id) ||
            !text(binding.management_spreadsheet_id)) fail('FORBIDDEN');
        var boundIds = [binding.data_spreadsheet_id, binding.management_spreadsheet_id];
        if (state.files.some(function (r) {
          return r.status === 'ACTIVE' && r.tenant_id !== tenantId &&
            (boundIds.includes(r.data_spreadsheet_id) || boundIds.includes(r.management_spreadsheet_id));
        })) fail('SECURITY_CONFIG_INVALID');
        ctx.tenantId = tenantId; ctx.role = role; ctx.staffId = access.staff_id || '';
        ctx.officeIds = Object.freeze(offices.slice());
        ctx.dataSpreadsheetId = binding.data_spreadsheet_id;
        ctx.managementSpreadsheetId = binding.management_spreadsheet_id;
      }
      Object.freeze(ctx); contexts.add(ctx); return ctx;
    }
    function bindingAllowed(ctx, binding) {
      return Boolean(ctx && contexts.has(ctx) && ctx.expiresAt > now() && ctx.scope === 'TENANT' &&
        binding && binding.tenantId === ctx.tenantId &&
        [ctx.dataSpreadsheetId, ctx.managementSpreadsheetId].includes(binding.spreadsheetId));
    }
    function recordAllowed(ctx, binding, record) {
      if (!bindingAllowed(ctx, binding) || !record || typeof record !== 'object' || Array.isArray(record)) return false;
      // For legacy per-tenant sheets without a row tenant_id, the verified binding
      // supplies the boundary. This is not permission to mix tenants in one sheet.
      if (own(record, 'tenant_id') && record.tenant_id !== ctx.tenantId) return false;
      if (ctx.recordScope !== 'TENANT' && (!text(record.office_id) ||
          (!ctx.officeIds.includes('*') && !ctx.officeIds.includes(record.office_id)))) return false;
      if (ctx.recordScope === 'OWN' && record.recruiter_id !== ctx.staffId) return false;
      return true;
    }
    function assertRecord(ctx, binding, record) {
      if (!recordAllowed(ctx, binding, record)) fail('FORBIDDEN');
    }
    function filterRecords(ctx, binding, rows) {
      if (!bindingAllowed(ctx, binding)) fail('FORBIDDEN');
      if (!Array.isArray(rows)) fail('BAD_REQUEST');
      // Apply BEFORE counts, pagination, aggregates and exports, not just in UI.
      return rows.filter(function (r) { return recordAllowed(ctx, binding, r); });
    }
    return Object.freeze({ authorize: authorize, assertRecord: assertRecord, filterRecords: filterRecords });
  }
  return Object.freeze({ create: create });
}());
if (typeof module !== 'undefined') module.exports = FcsRequestGuard;
