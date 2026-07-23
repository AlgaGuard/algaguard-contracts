# Device credential contracts

The additive credential v1 contracts define a portable per-device X.509 lifecycle without changing any released schema. A device generates its private key locally and submits only a CSR. No request, response, event, example, or stored metadata contract has a private-key field.

## Identity binding

Each issued client certificate binds one immutable `deviceUuid` in the SAN URI `urn:algaguard:device:<deviceUuid>`. The canonical `deviceId` is carried as the documented certificate CN for EMQX client-ID mapping, but authorization also validates the SAN URI and recorded SHA-256 fingerprint. `organizationId` is intentionally absent from certificates because ownership can change.

## Lifecycle

The credential states are `PENDING`, `ACTIVE`, `ROTATING`, `REVOKED`, `EXPIRED`, `COMPROMISED`, and `FAILED`. Rotation allows at most two credential IDs during a bounded overlap. A successful connection acknowledgement activates the child and revokes the parent with reason `ROTATED`. Credential history is immutable metadata, not reusable secret material.

The [device credential OpenAPI](../openapi/device-credential-service-v1.yaml) describes human, bootstrap, device-mTLS, and internal broker boundaries. The [credential rotation AsyncAPI](../asyncapi/algaguard-device-credential-v1.yaml) reuses the existing exact device command and command-result topics, so the MQTT topic major does not change.

## Compatibility

These files are new v1 documents and do not alter released schema IDs. Existing producers and consumers remain valid. Adoption requires security review because a client-certificate-only validity check is insufficient: implementations must validate stored credential state, fingerprint, SAN UUID, canonical device ID, and active device lifecycle.
