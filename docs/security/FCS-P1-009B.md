# FCS-P1-009B - Deployed-source capture and backend authorization prerequisites

Date: 2026-09-15
Status: DRAFT - SOURCE VERIFICATION AND LIVE STAGING STILL BLOCKED
Branch: feature/FCS-P1-009-auth-hardening
PR: #1
Technical sponsor: Victor; implementation delegated in the project conversation
Production acceptance: technical review and Tuan business acceptance remain required

## Outcome and limits

The requested outcome is a paired frontend/backend patch on the actual deployed
Apps Script source, followed by staging validation. That outcome is NOT complete.
This increment repairs a real CI dependency failure and adds a tested policy module
and a read-only source-capture utility. It does not substitute repository V4 Code.gs
for the unknown deployed source. No production router, Sheet, Firebase account,
Cloudflare setting or deployed endpoint has been changed.

The earlier FCS-P1-009.md describes the original 009A snapshot. This follow-up
supersedes its dependency/CI status only; its production blockers remain open.

## 1. Build failure repaired, not suppressed

The first PR run 34924940104 passed unit tests and Vite build but failed full
TypeScript checking because the existing src/server/firebaseAdmin.ts imported
firebase-admin/app and firebase-admin/auth without a declared dependency.

Commit 44c969d1f32982136da25ce29d7470034f466874 adds firebase-admin 14.4.0 exactly
and the npm-generated package-lock.json. CI run 34925644393 completed successfully.
No ambient any declaration or tsconfig exclusion was used to hide the failure.

A temporary isolated workflow generated the two manifest blobs without lifecycle
scripts, ref updates, deployment or production credentials. It has been removed.
The permanent security workflow remains contents:read, with no deploy step.

During lock generation npm reported four moderate audit findings. These remain
untriaged; CI success is not a dependency vulnerability clearance. Existing bundle
size warnings also remain open. Do not run a broad npm audit fix or SDK upgrade
against production merely to clear a report. npm/package-lock is the tested path;
the legacy bun.lock was not regenerated or certified in this increment.

## 2. Capture the DEPLOYED source, not editor HEAD

Added: scripts/export_deployed_apps_script.mjs (Node 22, built-ins only).

The owner supplies the real Apps Script project ID and deployment ID. The tool:

1. Reads deployment metadata with GET and requires a versioned Web App.
2. Reads projects.getContent with that exact versionNumber.
3. Reads deployment metadata again and refuses a changed version/configuration.
4. Produces a per-file SHA-256 manifest plus an aggregate source fingerprint.
5. Stores source locally in a new private directory, refusing overwrite.

It performs no API write, script execution, Sheet read, setup, migration, or deploy.
It does not retrieve Script Property values. Authentication is a short-lived user
OAuth token obtained locally by the authorized owner; the tool does not acquire
consent or tokens. Required read scopes are:

- https://www.googleapis.com/auth/script.projects.readonly
- https://www.googleapis.com/auth/script.deployments.readonly

The owner's OAuth client/API configuration must permit these reads. A deployment
URL is not a script project ID, and a Google Drive connection alone does not prove
Apps Script API authorization. No service-account private key or Workspace-wide
delegation is required by this utility.

Example after obtaining authorized local credentials (do not paste token values):

```sh
mkdir -p .system_generated
export FCS_GOOGLE_OAUTH_TOKEN_FILE=/absolute/private/path/google-readonly.oauth-token
node scripts/export_deployed_apps_script.mjs SCRIPT_ID DEPLOYMENT_ID .system_generated/deployed-source
```

On POSIX, the token file must be owner-only (0600). On Windows, the owner must
restrict its ACL because POSIX mode checks do not establish Windows privacy.
Output: manifest.json and source.private.json. Source may contain historical
secrets; keep it private and inspect before any public Git commit. Never post
OAuth tokens, passwords or private keys in a PR, Sheet, chat or workflow log.
The new ignore entries are a precaution, not a secret scanner.

The utility has been tested with local fixtures, NOT run against production.
The exact deployed script ID/version/source remain unavailable to this session.

## 3. Authorization policy module - candidate, not connected

Added: backend/security/RequestGuard.gs. This file has no doGet/doPost handlers
and does not alter backend/Code.gs. Do NOT paste or deploy it as a replacement app.

It requires three explicit server-owned adapters/configurations:

- verifyToken: genuine signature/issuer/audience/expiry/revocation and account-status
  verification. The module's claim checks are defense-in-depth, NOT cryptographic
  verification. No production verifier is implemented in this increment.
- loadState: read and normalize the real registry by verified Firebase UID. The
  state contract is internal, not an instruction to migrate the V1 Sheet.
- policies: approved action/role/record-scope map. Policies inside tests are ONLY
  fixtures, not production authorization decisions.

The candidate denies missing tokens and configuration, unknown actions, missing
or inactive users/memberships/tenants, duplicate registry entries, cross-tenant
payload conflicts, and shared active file bindings across distinct tenants.
It never assigns a default pilot tenant, default administrator, or wildcard office.
Client identity/email/role fields are not authoritative. Even a platform user needs
explicit membership for this candidate's tenant operations; any support workflow
must be documented and reviewed, not added as an implicit bypass.

Returned contexts are immutable, instance-bound and time-bounded. Record checks
require the verified physical Sheet binding, optional explicit row tenant_id,
and configured office/owner scope. Invalid context or binding raises FORBIDDEN;
it is not disguised as a successful empty result. Out-of-scope rows can be filtered
only after a valid authorized context. Filtering must precede counts, pagination,
aggregates and exports. For legacy single-tenant sheets without row tenant_id,
the verified file binding supplies the tenant boundary; no mixed-tenant storage
or automatic schema change is authorized by this helper.

The actual router still must call authorize before data access, assertRecord on
both existing and proposed records before mutations, and filterRecords before
all list/report aggregation. Cross-entity references and in-transaction changes
require validation in the real repository adapter. A context is request-scoped;
never persist or reuse it between requests. Audit only sanitized actor/action/
tenant/result fields, never raw requests containing idToken.

The existing backend remains unpatched until its deployed version is confirmed.
The synchronous adapter contract targets Apps Script; an asynchronous Admin SDK
function cannot be passed to it unchanged. Runtime support and the chosen verifier
must be tested in the actual staging environment, not inferred from Node tests.

## 4. Tests and evidence

Added local tests: 56 passed, zero failed on Node 22.16.0:

```sh
node --test tests/security/backend-boundary.test.cjs tests/security/source-capture.test.cjs
```

These cover denial before registry access, UID membership, tenant/office/owner
isolation, file-binding mistakes, active status, unknown actions, sanitized errors,
expired/forged contexts, explicit deployed-version capture, drift during capture,
private output and overwrite prevention.

One test executes the real PR apiClient.ts request envelope through SDK/HTTP test
doubles into the candidate guard. It checks contract compatibility, not real
Firebase signatures, Apps Script deployment, CORS, browser rendering or live data.
The permanent CI now runs all tests/security/*.test.cjs, plus full build and tsc.
Latest combined CI result must be read from the commit checks before any release.

## 5. Staging plan - NOT EXECUTED

Use a separate Apps Script project and synthetic tenant data, not merely a second
deployment in the production Script project. Script Properties belong to a script,
so treating another deployment as an isolated configuration risks touching the
production Sheet bindings. Preserve the current app architecture and business
rules; do not create V4 files merely to make tests pass.

Record a paired manifest: frontend SHA, source SHA, Script project/deployment/version,
verified Firebase project, non-secret staging file bindings, and approved policy
revision. Use explicitly configured preview ENV and do not give previews production
Sheet access. Confirm the deployed frontend SHA; main HEAD alone is not proof.

Required integration/release gates:

| Gate | Acceptance evidence |
| --- | --- |
| Exact source | Versioned source manifest maps to the actual production deployment; every handler and sheet header reviewed |
| Verifier | Missing/forged/expired/revoked token and disabled user rejected before business data access |
| Identity | UID matches active membership; changing client email/role/staff/tenant grants zero additional access |
| Tenant/office | Tenant A cannot read/update/export tenant B; office/owner restrictions applied to every affected endpoint |
| Schema | 100% affected fields/endpoints mapped to existing source; no unapproved V1-to-V4 migration |
| Business | Golden Flow reaches verified working result using synthetic data and the approved customer definition |
| Integrity | Repeated attendance import does not double-count; ambiguous matches require review; history preserved |
| Errors | Denial/outage is not returned as successful zero data; tokens and secrets absent from logs |
| Release | Credential containment completed, CI green, staging evidence recorded, rollback pair and human approvals present |

All live staging rows above are NOT RUN. The old shared-password account exposure
also remains a human containment task; deleting the seeder does not rotate passwords
or revoke existing sessions. Existing realApi error-to-empty-success behavior is
outside this helper and remains to repair and regress before release.

## 6. Human-only handoff and decision

The immediate blocker is one source/access evidence packet from the Apps Script
owner: the script project ID/link, the deployment matching the active API URL, its
version, and the corresponding source export including appsscript.json. The read-only
export tool is ready for that owner to use with authorized local OAuth credentials.
Do not rerun the old seeder, reset the Sheet, paste repository V4 into production,
or change production environment values to guess which project is correct.

Release decision: NO-GO until the real source is integrated and live staging passes.
No production file, endpoint, schema, account, credential, domain, deployment or
main branch has been modified by this increment. This does not certify the existing
production system as secure and does not assert its current health or deployed SHA.

## References

- https://developers.google.com/apps-script/api/reference/rest/v1/projects/getContent
- https://developers.google.com/apps-script/api/reference/rest/v1/projects.deployments/get
- https://developers.google.com/apps-script/guides/properties
- https://firebase.google.com/docs/auth/admin/verify-id-tokens
- https://github.com/victorChuyen/FCS-AI-WORKFORCE/actions/runs/34925644393
