# FCS AI WORKFORCE OS — ANTIGRAVITY EXECUTION HANDOFF

**Document type:** Technical execution handoff  
**Project:** FCS AI WORKFORCE OS — MASTER BUILD  
**Current phase:** V4 Multi-Tenant SaaS Core — Phase 1 Production Pilot  
**Pilot tenant:** `FCS-000001`  
**Handoff date:** 2026-09-15  
**Timezone:** Asia/Bangkok (UTC+07:00)  
**Requested by:** Victor / Project technical authority in the current working session  
**Target agent:** Antigravity  
**Primary objective:** Continue and complete Phase 1 safely using the real production environment, without rebuilding or breaking the currently working system.

---

# 1. START HERE — EXECUTION PRINCIPLE

You are entering an existing system that is already online and working.

**Do not rebuild the project from scratch.  
Do not overwrite production blindly.  
Do not assume repository backend code is identical to the currently deployed Apps Script backend.  
Do not change business definitions, Google Sheet schema, Worker IDs, VWW logic, Firebase project, Cloudflare ENV, or production endpoints without evidence.**

Work in this order:

`VERIFY CURRENT STATE → MATCH SOURCE TO DEPLOYMENT → HARDEN SECURITY → STAGE → TEST → REVIEW → RELEASE`

Primary priorities:

`DATA INTEGRITY → TENANT SECURITY → BUSINESS WORKFLOW → SIMPLE UX → STABILITY → AUTOMATION`

The objective is not to add more features. The objective is to make the existing Phase 1 core reliable, secure, testable and releaseable.

---

# 2. BUSINESS NORTH STAR

FCS AI WORKFORCE OS must reliably answer:

- Who entered the recruitment funnel?
- Who was contacted and qualified?
- Who passed interview?
- Who was expected to start?
- Who actually started?
- Who generated attendance/workdays?
- Who was matched to the correct worker?
- Who became a verified actual working worker?
- What operational/business result was produced?

End-to-end flow:

`Worker Source → Recruitment → Contact → Qualification → Interview → Interview Result → Expected Start → Actual Start → Attendance → Matching → Verified Actual Working Worker → VWW / Business Result`

Important business rule:

`Interview success ≠ expected start ≠ actual start ≠ actual work`

Actual work must be evidenced by operational data.

Do **not** invent the final VWW formula. The project sources contain different historical representations and the final production business definition still requires business confirmation.

---

# 3. PHASE 1 SCOPE

Phase 1 modules:

- Tenant / Company
- Offices
- Staff / Users
- Workers
- Jobs
- Partners / Factories
- Recruitment Pipeline
- Interview
- Going-to-work / Start
- Attendance
- Matching
- Exception Review
- Dashboard / KPI
- Reports / Export
- Audit Trail

Out of scope for this release:

- AI Worker Care
- Full Zalo automation
- Payroll
- Finance
- Rewards
- Billing gateway
- Advanced marketing automation
- Heavy AI-agent orchestration
- Unnecessary microservices

Do not let Phase 2/3 code distract from Phase 1 stabilization.

---

# 4. SOURCES OF TRUTH AND PRIORITY

Use the following hierarchy.

## 4.1 Business / project authority

`FCS_AI_WORKFORCE_OS_MASTER_CONTEXT.md`

This defines mission, Phase 1 scope, security invariants, UX principles, architecture direction and Definition of Done.

## 4.2 Team governance authority

`FCS_TEAM_GOVERNANCE_RULES_SKILL.md`

Follow approval, review, QA, Git and handoff rules.

## 4.3 Code source of truth

GitHub repository:

`https://github.com/victorChuyen/FCS-AI-WORKFORCE`

Current known main baseline at handoff:

`2387b1ac838efde76149b7b7d59e0b1d5474c088`

Do not assume this SHA is the Cloudflare deployed SHA until Cloudflare deployment metadata confirms it.

## 4.4 Existing operational data evidence

Google Sheet:

`FCS_AI_WORKFORCE_OS_MASTER_V1`

Known file ID:

`1cGm6h-Py1Da5-uWYm2KkKYCWIEWtzDe6uwDwhai2o0E`

This workbook contains the existing operational data contract, Golden Flow, worker/pipeline/interview/start/attendance/matching structures, configuration, audit and reporting tabs.

Treat customer files and actual workflow as evidence.

Do not redesign the canonical schema until existing data is mapped.

## 4.5 Deployment layer

Cloudflare Pages project:

`fcs-ai-workforce`

Production application:

`https://fcs.breaths.live/`

Pages domain:

`https://fcs-ai-workforce.pages.dev/`

Cloudflare dashboard project URL previously supplied:

`https://dash.cloudflare.com/f089da986b216692047f5132563c523d/pages/view/fcs-ai-workforce`

Do not change production settings until staging evidence and rollback references exist.

---

# 5. CURRENT TECHNICAL ARCHITECTURE

Current architecture direction:

## Frontend

- React / TypeScript / Vite
- GitHub as source control
- Cloudflare Pages as deployment layer

## Authentication

- Firebase Authentication
- Current client hardening work expects authenticated Firebase sessions
- Tenant and role must never be trusted merely because the browser sends them

## Backend / lightweight services

- Google Apps Script
- Google Sheets
- Google Drive

## SaaS / security services

- Firebase / Google Cloud where needed for authentication, role management and future scalable services

## Automation

- Prefer Apps Script and direct APIs for Phase 1
- Do not introduce n8n unless a genuinely complex orchestration need is demonstrated

---

# 6. NON-NEGOTIABLE TENANT SECURITY

Every business record must respect `tenant_id`.

For all protected operations, enforce:

`Authenticated user → verify identity → resolve internal user/membership → resolve tenant → authorize role/office → access only authorized tenant data`

Frontend filtering is **not security**.

The browser must not be able to become another tenant, role or user by changing:

- URL
- request body
- email
- role
- tenantId
- staffId
- officeId
- localStorage
- query parameters

Required security outcome for `FCS-000001`:

A normal tenant user must never read, update, delete or export another tenant's records.

Do not auto-merge ambiguous workers.

Do not auto-provision privileged membership from a request.

Do not default an unauthenticated request to the pilot tenant or super-admin.

---

# 7. CURRENT GITHUB WORK STATE

Open PR:

`https://github.com/victorChuyen/FCS-AI-WORKFORCE/pull/1`

Current title at handoff:

`[FCS-P1-009A/B] Auth hardening, CI repair and backend integration prerequisites — draft`

Current working branch:

`feature/FCS-P1-009-auth-hardening`

Current known PR head:

`bd70798b325fd5db8eff2507e1f8f0813ec30433`

At the latest verified checkpoint:

- PR is OPEN
- PR is DRAFT
- PR is NOT MERGED
- PR is mergeable
- 5 commits
- 22 changed files

Do not merge simply because CI is green.

---

# 8. WHAT HAS ALREADY BEEN IMPLEMENTED IN THE DRAFT PR

## FCS-P1-009A — Client authentication hardening

The draft patch removes or blocks the following unsafe behaviors:

- preset / one-click authentication bypass
- silent fallback to a privileged user when Firebase fails
- restoration of trusted identity from editable browser localStorage
- deriving tenant/role from email text
- fake/mock bearer tokens
- password prefill in the login page
- production mock-mode switching through browser state
- shared-password Firebase seeding behavior

The patch moves the client toward:

- real Firebase authentication
- Firebase session/token use
- custom-claim projection on the client
- fail-closed behavior
- session-change handling
- verified email requirement
- no tenant enrollment merely from registration
- rejecting stale private responses after user/tenant changes

Important:

**Client-side custom claims are not sufficient authorization. Backend verification remains mandatory.**

## CI / dependency repair

`firebase-admin@14.4.0` was added to resolve the existing Admin SDK import/typecheck issue.

Current tested dependency path is npm + package-lock.

`bun.lock` is not considered the verified build source.

## FCS-P1-009B — Backend security preparation

A candidate module exists:

`backend/security/RequestGuard.gs`

Its design intent is fail-closed policy around:

- verified Firebase identity
- active UID membership
- tenant status
- role
- office scope
- action scope
- record ownership where applicable
- tenant file binding

This module is **not yet proof of production security**.

It is not yet confirmed to be wired into the actual deployed production handler.

Do not treat offline fixtures as the final approved permission matrix.

## Source / staging tools

The PR also contains tooling to:

- capture Apps Script deployment/source by explicit version
- detect source/deployment drift
- validate staging inventory and separation
- avoid silently treating a second deployment of the same production project as isolated staging

These tools are preparation for controlled verification, not proof that staging exists.

---

# 9. VERIFIED TEST STATE

Latest verified GitHub Actions run:

`https://github.com/victorChuyen/FCS-AI-WORKFORCE/actions/runs/34926356533`

Latest verified results:

**security-unit**
- 140 tests
- 140 passed
- 0 failed
- 0 skipped

**build-and-types**
- npm install/CI step: success
- production build: success
- TypeScript / lint check: success

Test composition recorded in the PR:

- 57 client/security tests
- 56 backend-policy/source-capture tests
- 27 staging-inventory tests

Critical interpretation:

These are mostly automated/offline tests using doubles where needed.

They do **not** prove:

- real Firebase token signature verification
- token revocation behavior
- real Firebase membership
- actual Apps Script deployment identity
- real Google Drive permissions
- real tenant isolation on production data
- browser integration
- Cloudflare preview isolation
- Golden Flow success against a staging backend

Do not convert “CI green” into “production ready”.

---

# 10. KNOWN P0 SECURITY / RELEASE BLOCKERS

## P0-1 — Production Apps Script source is not yet proven

This is the highest-priority blocker.

Repository `backend/Code.gs` must not be assumed to equal the currently deployed backend.

Before backend modification, establish:

`production API endpoint → Apps Script deployment ID → versionNumber → Script project ID → exact deployed source → appsscript.json → backing data resources`

Capture this information read-only first.

Do not deploy V4 over an unknown production backend.

## P0-2 — Server-side Firebase verification must be real

The backend must validate Firebase ID tokens before any protected Sheet access.

Required checks include:

- token authenticity/signature
- expected Firebase project / audience
- issuer
- expiry
- account validity/revocation where supported by the selected verifier path
- UID

After identity verification, resolve authorization from trusted server-side membership.

Never authorize from body-provided email/role/tenant.

## P0-3 — Membership / tenant / office authorization

Trusted backend membership must resolve at minimum:

- firebase UID
- tenant_id
- role
- office scope
- staff ID
- active/suspended status

Every protected read/write/export must enforce it.

## P0-4 — Firebase project identity is not yet fully reconciled

Historical/current sources reference:

`fcs-ai-workforce`

The supplied Google Cloud Console project is:

`fcs-ai-workforce-508702`

Do not migrate, rename or replace Firebase configuration based solely on project names.

Identify which project actually authenticates the currently deployed production application.

## P0-5 — Credential containment

A historical provisioning script contained a shared pilot password.

Do not print or reuse that password.

Required human/admin containment:

- rotate affected Firebase account credentials
- revoke old sessions/refresh tokens where appropriate
- verify real UIDs and membership
- ensure no secret remains in active code/config

Removing a credential from current source does not remove it from Git history or invalidate it.

## P0-6 — Production versus staging

No production release until there is a staging pair that is isolated from production.

Staging must not silently reuse:

- production Apps Script project
- production operational Sheets
- production employee/worker data
- production privileged credentials

---

# 11. YOUR IMMEDIATE MISSION AS ANTIGRAVITY

You have a more complete execution environment.

Use it to finish the parts the previous agent could not safely perform.

## Step 1 — Inventory production read-only

Without changing production:

1. Inspect Cloudflare Pages deployment history.
2. Record current production deployment / commit if available.
3. Record preview branch behavior and environment bindings.
4. Determine the production `VITE_*` public configuration names.
5. Do not expose secret values in logs or reports.
6. Identify the current backend API endpoint used by the deployed frontend.
7. Identify the Firebase project actually used by production.
8. Identify Apps Script deployment/project/version serving that endpoint.

Deliverable:

`FCS-P1-009C-PRODUCTION-INVENTORY.md`

Required mapping:

`frontend deployment → frontend commit → API endpoint → Script deployment → Script version → Script project → Firebase project → backing Sheets/Drive resources`

Mark unknown items explicitly.

Do not infer.

## Step 2 — Capture the actual deployed Apps Script source

Use authenticated, read-only Apps Script access.

Capture:

- Script project ID
- deployment ID
- deployment version
- all source files for the deployed version
- `appsscript.json`
- execution settings relevant to web app behavior
- names of Script Properties needed by the application, but never put secret values into Git/chat/public reports
- referenced spreadsheet/file IDs if non-sensitive and needed for mapping

Hash captured source.

Compare it to:

- repository `backend/Code.gs`
- candidate V4 security work
- current Sheet V1 structure

Deliverable:

`FCS-P1-009C-BACKEND-SOURCE-DIFF.md`

Classify:

- exact match
- partial match
- legacy production source
- repository ahead of production
- production ahead of repository
- unresolved

Do not overwrite production.

## Step 3 — Decide the backend hardening path based on evidence

Only after Step 2.

If deployed backend matches repository source closely:

- integrate the real verifier and trusted membership adapter into a staging copy
- wire `RequestGuard` or its reviewed equivalent into every protected handler

If deployed backend differs materially:

- branch from the actual production source
- preserve production behavior
- port only the required security controls incrementally
- do not replace it with repository V4 wholesale

If authorization architecture requires a Cloudflare gateway to verify Firebase tokens before Apps Script:

- implement the simplest secure gateway
- use least privilege
- document why direct Apps Script verification is insufficient for the chosen implementation
- do not add unnecessary infrastructure

The final security boundary must be explicit and testable.

## Step 4 — Build isolated staging

Create or verify:

- staging frontend deployment
- staging backend / Script project
- staging data resources containing test data only
- staging Firebase/account configuration as appropriate
- staging ENV
- no production write access

Staging frontend must not be:

`https://fcs.breaths.live/`

or the production Pages domain.

Record the exact pair:

`frontend SHA + frontend staging URL + backend deployment/version + staging data IDs`

This pair becomes the QA artifact.

## Step 5 — Run live security QA

At minimum test:

- no token
- malformed token
- expired token
- revoked/disabled account
- authenticated user absent from membership registry
- suspended membership
- wrong tenant in body
- wrong tenant in URL
- forged role
- forged staffId
- forged officeId
- unauthorized office
- recruiter attempting manager/admin action
- tenant A attempting tenant B read
- tenant A attempting tenant B update
- tenant A attempting tenant B export
- super-admin tenant switching through the trusted path
- logout during request
- account/tenant switch during request

Expected behavior:

Unauthorized access is denied before sensitive data is returned or mutated.

For direct Apps Script paths where HTTP status limitations exist, validate the explicit error envelope as well.

## Step 6 — Run live Golden Flow QA

Use test records only.

Required path:

`Login → Worker → Recruitment/Pipeline → Interview → Interview Result → Expected Start → Actual Start → Attendance → Matching → Exception Review if needed → Verified Actual Working Worker → KPI/Report`

Test:

- valid flow
- no-show
- failed interview
- expected start but no actual start
- actual start with missing attendance
- attendance with no worker
- exact match
- ambiguous match
- repeated attendance import
- duplicate worker candidate
- correction/review
- export permissions
- audit trail

No silent duplication.

No fake zero-success responses.

No cross-tenant leakage.

## Step 7 — Data mapping before migration

Do not migrate V1 blindly.

Produce source-to-target mapping from the 20-tab operational workbook into the V4 conceptual split.

At minimum classify each source field as:

- retained canonical field
- normalized field
- reference/master data
- operational event
- audit metadata
- derived KPI
- deprecated/not required
- requires business clarification

Preserve Worker IDs and traceability.

Do not change VWW business definition without explicit business evidence.

## Step 8 — Release recommendation

Do not release automatically merely because technical tests pass.

Produce:

`FCS-P1-009-RELEASE-READINESS.md`

with:

- production inventory
- exact code/deployment pair
- staging evidence
- security test results
- Golden Flow results
- data reconciliation results
- dependency/security findings
- known residual risks
- rollback plan
- recommended GO / NO-GO

Production requires the existing governance approval chain.

---

# 12. HUMAN-ONLY OR HUMAN-APPROVAL ACTIONS

If your environment has authenticated browser access, you may perform authorized operational steps that are reversible and within the approved task.

However, explicitly stop for human approval when required by project governance or when an action has irreversible/high-impact consequences.

Human/admin responsibilities include:

- rotating real account credentials
- revoking real user sessions
- approving new IAM grants broader than already authorized scope
- approving migration of production data
- approving production cutover
- final technical review by Victor
- business acceptance by Tuấn before production release

Never ask a human to paste passwords, private keys or access tokens into chat.

If a human action is required, provide:

`WHAT TO DO → WHERE → EXACT EXPECTED RESULT → HOW YOU WILL VERIFY IT`

Avoid vague instructions.

---

# 13. CLOUD / IAM RULES

Use least privilege.

Do not grant runtime:

- Owner
- Editor
- broad Workspace domain access

Do not enable Google Workspace Domain-Wide Delegation unless a real Phase 1 requirement is demonstrated.

GCP IAM does not itself grant access to individual Google Drive/Sheets files.

Share only the resources the runtime needs.

Do not enable every Google API “just in case”.

Do not commit service-account keys.

Do not put secrets in `VITE_*`.

For Cloudflare:

- public Firebase web config may be frontend configuration
- server credentials/secrets must stay in server-side secret storage
- preview environments must not inherit production write credentials without explicit justification

---

# 14. GIT / RELEASE RULES

`main` is the production baseline and must be protected operationally.

Current main baseline at this handoff:

`2387b1ac838efde76149b7b7d59e0b1d5474c088`

Current draft security branch:

`feature/FCS-P1-009-auth-hardening`

Do not commit directly to `main`.

Do not merge PR #1 until backend/staging evidence is complete.

If the actual production Apps Script source materially differs from the repository backend:

- preserve PR #1 as client/security-preparation evidence
- create a dedicated backend branch based on the verified source strategy
- document relationship between branches

Every release must have an identified rollback pair.

Rollback is not “restore known insecure authentication and hope”.

---

# 15. DATA INTEGRITY RULES

Every business record must be traceable.

Where applicable preserve:

- tenant_id
- created_at
- created_by
- updated_at
- updated_by
- status
- source_system
- import_batch_id
- external_id

Customer spreadsheet headings are not automatically canonical schema.

Normalize source fields through mapping.

Matching must be explainable.

Ambiguous matches go to review.

Do not silently merge.

Do not silently discard invalid attendance.

Repeated imports must not create double business results.

---

# 16. UX RULES

Worker UX:

- mobile-first
- low digital literacy
- large buttons
- clear Vietnamese labels
- minimal typing
- dropdowns where possible
- clear success/error states
- target: very few taps

Management UX:

- operational visibility
- search
- filters
- exceptions
- KPIs
- drill-down
- exports where authorized

Do not add complexity merely because the underlying architecture is complex.

---

# 17. DEFINITION OF DONE FOR PHASE 1

Phase 1 is not done because screens render.

It is done when:

**Tenant**
- FCS-000001 operates correctly
- no unauthorized cross-tenant read/write/export

**Authentication**
- login works
- server verifies identity
- roles are enforced

**Workers**
- add/import/search/update
- duplicates are visible/manageable

**Pipeline**
- transitions work
- interview and start events are traceable

**Attendance**
- imports work
- invalid records are visible

**Matching**
- exact matches work
- ambiguous/unmatched records enter review
- no silent wrong merge

**Management**
- funnel and exception visibility works

**Reporting**
- verified actual working result can be produced and traced back to operational evidence

**UX**
- practical on mobile and simple for operators

**Stability**
- no critical console/runtime error
- no data-loss defect
- no tenant leakage
- no broken Golden Flow

Final demo path:

`Login FCS-000001 → Dashboard → Pipeline → Worker → Interview → Going-to-work → Attendance → Matching → Verified Actual Working Worker → KPI/Report`

---

# 18. ACCEPTANCE GATES FOR YOUR HANDOFF BACK

Before claiming “ready for production”, provide evidence for all of the following:

| Gate | Required evidence |
| --- | --- |
| Production identity | Cloudflare deployment/commit + API endpoint + Firebase project |
| Backend identity | Script project + deployment + version + source hash |
| Tenant security | Live staging tests for read/write/export cross-tenant denial |
| Role/office security | Live staging denial tests |
| Auth security | Missing/invalid/expired/revoked token behavior |
| Golden Flow | End-to-end test records and expected results |
| Data integrity | No duplicate/lost worker/attendance/business result |
| V1 compatibility | Source-to-target mapping and reconciliation |
| Error semantics | Backend failures are visible, not fake success/zero |
| Rollback | Exact frontend/backend version pair and restoration procedure |
| Approval | Technical review + business acceptance |

If one is missing, status is:

`NOT READY`

Do not soften missing evidence.

---

# 19. CURRENT KNOWN NON-BLOCKING TECH DEBT

At the current checkpoint:

- npm reported 4 moderate dependency vulnerabilities requiring triage
- bundle size warning exists
- bun.lock is not synchronized with the verified npm/package-lock build path

Do not make dependency upgrades opportunistically inside the security/backend change unless needed.

Triage them separately after P0 release blockers.

---

# 20. REPORTING / HANDOFF DISCIPLINE

Project report folder:

`https://drive.google.com/drive/u/4/folders/175emhrMIpM6j5zv8pFwY1P-bOiP2hAbn`

Current reporting protocol:

`00_FCS_REPORTING_PROTOCOL.md`

For every working session/shift:

- create/update a Markdown checkpoint
- record exact branch/commit/PR
- record test run IDs
- distinguish offline CI from staging from production
- record data/security impact
- record blockers
- state next action
- state human approval required
- never put secrets or worker PII into the report folder

The report folder was observed to have public-reader exposure at the previous checkpoint.

Therefore reports stored there must remain sanitized.

---

# 21. FIRST RESPONSE EXPECTED FROM ANTIGRAVITY

Before changing production, return a concise execution checkpoint containing:

**ACTIVE PROJECT**  
FCS AI WORKFORCE OS — MASTER BUILD

**PHASE**  
Phase 1 Production Pilot — FCS-000001

**VERIFIED PRODUCTION FRONTEND**  
URL + Cloudflare deployment/commit if resolvable

**VERIFIED BACKEND**  
API endpoint + Script deployment/version/project if resolvable

**VERIFIED FIREBASE PROJECT**  
Actual production project

**CURRENT GIT BASELINE**  
main SHA + PR branch/head

**DATA SOURCES**  
Production and staging resource IDs, sanitized

**P0 BLOCKERS**  
Only evidence-based blockers

**NEXT CONTROLLED ACTION**  
The smallest reversible action that moves toward verified staging

Do not begin migration or production cutover until the inventory is complete.

---

# 22. FINAL OPERATING INSTRUCTION

You are not being asked to redesign FCS AI WORKFORCE OS.

You are being asked to **finish and stabilize the system that already exists**.

Protect the working production system.

Use real evidence.

Fix the trust boundary.

Prove tenant isolation.

Prove the Golden Flow.

Preserve customer data.

Keep the architecture simple.

Only then recommend release.

**Current status at handoff: DRAFT SECURITY HARDENING EXISTS; CI GREEN; PRODUCTION BACKEND SOURCE NOT YET VERIFIED; STAGING LIVE QA NOT YET COMPLETED; PRODUCTION RELEASE NOT APPROVED.**
