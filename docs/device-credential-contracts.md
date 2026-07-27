# Device credential contracts

The additive credential v1 contracts define a portable per-device X.509 lifecycle without changing any released schema. A device generates its private key locally and submits only a CSR. No request, response, event, example, or stored metadata contract has a private-key field.

## Identity binding

Each issued client certificate binds one immutable `deviceUuid` in the SAN URI `urn:algaguard:device:<deviceUuid>`. The canonical `deviceId` is carried as the documented certificate CN for EMQX client-ID mapping, but authorization also validates the SAN URI and recorded SHA-256 fingerprint. `organizationId` is intentionally absent from certificates because ownership can change.

## Lifecycle

The credential states are `PENDING`, `ACTIVE`, `ROTATING`, `REVOKED`, `EXPIRED`, `COMPROMISED`, and `FAILED`. Certificate fields are explicitly `null` until successful issuance so failed attempts remain visible without fabricating metadata. Rotation allows at most two credential IDs during a bounded overlap. A successful connection acknowledgement activates the child and revokes the parent with reason `ROTATED`. Credential history is immutable metadata, not reusable secret material.

The [device credential OpenAPI](../openapi/device-credential-service-v1.yaml) describes human, bootstrap, device-mTLS, and internal broker boundaries. The [credential rotation AsyncAPI](../asyncapi/algaguard-device-credential-v1.yaml) reuses the existing exact device command and command-result topics, so the MQTT topic major does not change.

## Secure claim-to-CSR bootstrap bridge

An authenticated mobile claim creates a short-lived BLE session. A device transfers that opaque session proof only through the protected BLE provisioning session and calls `POST /api/v1/device-credential-bootstrap/exchange` over TLS. The exchange atomically consumes the BLE session and returns a new, one-time, CSR-issue-only bootstrap token. The service derives device ID, device UUID, organization, ownership version, claim-session identity, purpose (`CSR_ISSUE`), and contract version from trusted stored state; firmware cannot choose those bindings.

The existing `POST /api/v1/device-credential-bootstrap/issue` contract remains compatible. It accepts only the device-generated CSR and its one-time bootstrap bearer token, then returns public certificate material and CA chain. Implementations validate the CSR identity against the trusted authorization binding and consume the token only when issuance commits. They never accept, store, or return a device private key.

The exchange request permits an optional `deviceId` exclusively to give an explicit `DEVICE_MISMATCH` denial. It deliberately rejects caller-supplied organization or device UUID authorization. Implementations use stable problem codes: `INVALID_SESSION_TOKEN`, `EXPIRED_SESSION_TOKEN`, `USED_SESSION_TOKEN`, `DEVICE_MISMATCH`, `DEVICE_INACTIVE`, `OWNERSHIP_VERSION_CHANGED`, `CLAIM_INVALID`, `BOOTSTRAP_TOKEN_INVALID`, `BOOTSTRAP_TOKEN_EXPIRED`, `BOOTSTRAP_TOKEN_USED`, `CSR_INVALID`, `CSR_IDENTITY_MISMATCH`, and `RATE_LIMITED`. Their HTTP mapping must not disclose arbitrary token existence beyond the service's safe error policy.

The older `/v1/devices/{deviceId}/bootstrap` implementation path, where enabled, is a development-only compatibility path because it can return credential material without a CSR. Production-style device enrollment migrates to exchange plus CSR issue and must not use that route.

## Compatibility

These files are new v1 documents and do not alter released schema IDs. Existing producers and consumers remain valid. Adoption requires security review because a client-certificate-only validity check is insufficient: implementations must validate stored credential state, fingerprint, SAN UUID, canonical device ID, and active device lifecycle.
