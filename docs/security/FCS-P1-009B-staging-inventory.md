# FCS-P1-009B - Staging inventory preflight

Status: OFFLINE VALIDATOR; NOT LIVE STAGING ACCEPTANCE
Date: 2026-09-15
Companion: FCS-P1-009B.md (source handoff and backend policy candidate)

## Purpose

Reject obvious production/staging configuration overlap before running tests.
This is a preflight for supplied evidence, not a deployment tool, backend verifier,
cloud-permissions audit or replacement for the current Apps Script source.

The utility is compatible with the existing source export: manifest.json plus
source.private.json. It reads these files and verifies per-file hashes, aggregate
hash, script identity, version and the Apps Script manifest. It never changes or
executes the source files. Keep captures and inventory under .system_generated/
(which is ignored by Git). Never upload unreviewed captures to the public repo.

## Input and command

After an authorized owner has captured each deployed version using the existing
scripts/export_deployed_apps_script.mjs, prepare a private JSON inventory with:

- productionSourceSha256 and stagingSourceSha256, from each capture manifest.
- productionEndpoint and stagingEndpoint, matching each deployment's /exec URL.
- productionSpreadsheetIds and stagingSpreadsheetIds: complete inventories,
  including registry/config/master spreadsheets, without overlap or duplicates.
- stagingFrontendUrl: an HTTPS staging address, not either production domain.
- frontendCommit: the verified 40-character staging frontend commit SHA.
- scriptPropertiesReviewed and allDataResourcesListed: true only after review.
- reviewedBy and reviewedAtUtc: the actual reviewer and timestamp.

```sh
node scripts/check_staging_isolation.mjs \
  .system_generated/production-capture \
  .system_generated/staging-capture \
  .system_generated/staging-inventory.json
```

A second deployment in the same Apps Script project is rejected. The exact
configured Script Properties, registry mappings, hardcoded resource IDs, Drive
folders, triggers and external integrations must still be reviewed by the owner.
A copied spreadsheet alone is not staging isolation.

## Result meaning

Success returns ISOLATION_MANIFEST_VALID_NOT_LIVE_TESTED. The validator cannot prove
that a reviewer is truthful, the inventory is complete, hashes originated from
Google, cloud permissions are safe, or the frontend actually serves the declared
commit/endpoint. It makes no network request. A pass must never be described as
successful Firebase authentication, tenant isolation, Golden Flow or approval.

## Acceptance and tests

27 added offline tests check capture-format compatibility, altered bytes/hashes,
version mismatch, symlink rejection, shared Script project or data, wrong endpoint,
production frontend addresses and missing review evidence. Run:

```sh
node --test tests/security/staging-isolation.test.cjs
```

Live paired frontend/backend QA remains NOT RUN. Its required cases are in
FCS-P1-009B.md: invalid/revoked tokens, active UID membership, action/role/office/
tenant permissions, exports, duplicate imports and the original Golden Flow.
The crypto verifier and real registry adapter remain missing until deployed source
is reviewed. Production release remains NO-GO; this utility creates no environment,
changes no deployed handler, and does not address real credential rotation.

Reference: https://developers.google.com/apps-script/guides/properties
