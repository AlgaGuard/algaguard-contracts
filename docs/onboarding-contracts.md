# Claim QR and BLE bootstrap contracts

Status: additive Platform Completion Sprint contracts. Existing HTTP, MQTT, and WebSocket v1 contracts are unchanged.

## Compact claim QR

The QR value is UTF-8 JSON conforming to [`claim-qr-v1`](../schemas/onboarding/claim-qr-v1.schema.json). Its deliberately short keys keep the symbol practical for a 128x64 OLED:

- `v` is the integer wire version;
- `d` is the device identifier;
- `c` is the high-entropy, short-lived, one-time claim secret;
- `e` is the UTC expiry;
- `f` is the rate-limited manual fallback code.

The scanner rejects unknown versions, malformed identifiers, and expired payloads before calling HTTPS. The claim secret and fallback code are credentials: applications and services redact them from logs, metrics, traces, errors, crash reports, analytics, and browser history. The QR never contains a Wi-Fi secret, private key, permanent MQTT password, device credential, or long-lived user token.

## Bootstrap session

After an authenticated and authorized HTTPS claim, the Device Service may issue a short-lived [`bootstrap-session-v1`](../schemas/onboarding/bootstrap-session-v1.schema.json). The session is bound to one device, expires, is consumed at most once, and uses the schema-constrained canonical AlgaGuard BLE provisioning service UUID. `sessionToken` is ephemeral session proof, not a permanent device credential, and receives the same redaction treatment as the claim secret.

The mobile client scans only the expected service UUID, connects, and sends [`ble-provisioning-request-v1`](../schemas/onboarding/ble-provisioning-request-v1.schema.json) through the protected provisioning session. SSID and password do not appear in QR or HTTPS query strings. Both peers keep the password only for the active attempt and clear its buffers on success, failure, cancellation, timeout, or disconnect. Implementations must apply a UTF-8 byte limit of 32 bytes to SSID values in addition to schema validation.

The device reports bounded progress through [`ble-provisioning-result-v1`](../schemas/onboarding/ble-provisioning-result-v1.schema.json). A `FAILED` result includes a machine-readable `errorCode` but never echoes the SSID, password, session token, or claim secret.

These contracts permit fake-adapter and host validation. They do not prove BLE link protection, radio interoperability, QR camera behavior, Wi-Fi association, or physical ESP32 success; those require separate hardware evidence.

## Development-only physical session handoff

The physical-session handoff is development-only and is rejected at startup in
production or release deployments. A local utility starts a bounded handoff
using [`physical-session-handoff-start-request-v1`](../schemas/onboarding/physical-session-handoff-start-request-v1.schema.json).
It receives a high-entropy `deviceCode`, a short `userCode`, expiry, and a
minimum polling interval. The `userCode` is only an approval correlation value;
it cannot redeem a session.

An authenticated mobile client approves the code with an active bootstrap
session using [`physical-session-handoff-approve-request-v1`](../schemas/onboarding/physical-session-handoff-approve-request-v1.schema.json).
The service validates the session hash, device binding, organization ownership,
and ownership version. It stores the approved bundle only as AEAD ciphertext in
Redis with a TTL no later than the session expiry. Redemption uses the device
code in a POST body, returns the bundle once, and rejects expiry and replay.
Codes, session tokens, encrypted bundles, and approval/redeem bodies are never
put in URLs, logs, traces, metrics, database rows, or plaintext Redis values.
No physical provisioning occurs under this contract.

## Owned-device bootstrap reissue

The additive
[`owned-device-bootstrap-reissue-request-v1`](../schemas/onboarding/owned-device-bootstrap-reissue-request-v1.schema.json)
is retained for compatibility. Development physical onboarding uses
[`owned-device-bootstrap-reissue-request-v2`](../schemas/onboarding/owned-device-bootstrap-reissue-request-v2.schema.json),
which omits a client-selected lifetime: the server-returned `expiresAt` is the
authoritative expiry.
supports a bounded development/demo recovery for an already-owned `CLAIMED`
device. The authenticated current owner supplies the current ownership version
in the HTTPS body. Success returns the existing `bootstrap-session-v1` shape
exactly once with `Cache-Control: no-store`; only the token hash is retained.
The operation neither creates a claim/device/ownership row nor changes owner,
ownership version, or lifecycle. Active-session duplication, cross-organization
access, stale ownership, and ineligible lifecycle states fail closed.

## Compatibility

All onboarding additions are new v1 documents. No existing required field,
type, enum, topic, API path, subscription rule, or protocol meaning changes.
The additions are compatible for existing producers and consumers because they
do not receive these messages unless they implement the new onboarding flow.
