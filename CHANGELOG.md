# Changelog

All notable contract changes are recorded here. Dates use ISO 8601.

## Unreleased

- 2026-08-02: Add a development-only scan-first QR exchange request that binds a provisional device to an authenticated organization; the existing owned-device request remains unchanged.
- 2026-07-30: Constrain bootstrap-session responses to the canonical AlgaGuard BLE provisioning service UUID and add cross-consumer drift checks.

### Added

- 2026-07-30: Additive owner-authorized, no-store bootstrap-session reissue contract for development/demo recovery without device or ownership mutation.
- 2026-07-24: Compatible device bootstrap, CSR issuance, credential metadata/status, rotation, revocation, and health schemas with validated examples.
- 2026-07-24: Separate device credential OpenAPI and credential rotation AsyncAPI without changing released documents.
- 2026-07-23: Additive dual device identity, trusted internal context, post-commit telemetry, and WebSocket v1.1 telemetry contracts with migration guidance and cross-service fixtures.
- 2026-07-23: Additive compact claim QR and short-lived BLE bootstrap session contracts, examples, security semantics, and validation coverage.
- 2026-07-22: Phase 2.1 portable WebSocket envelopes, subscription and error messages, domain events, AsyncAPI, delivery policies, examples, and validation coverage.
- 2026-07-22: Phase 2 foundation for common envelopes, MQTT payloads, OpenAPI, AsyncAPI, examples, validation tooling, tests, and compatibility policies.
