/**
 * FCS-P1-009: Retired unsafe pilot seeder.
 * The former script embedded a shared password and reset existing accounts.
 * Never invoke the historical version, including as a credential-rotation tool.
 * See docs/security/FCS-P1-009.md for the controlled provisioning/rotation gates.
 */
console.error('FCS_PROVISIONING_DISABLED: legacy shared-password seeding is retired.');
process.exitCode = 1;
