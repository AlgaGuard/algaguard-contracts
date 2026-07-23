# Device identity and trusted context

AlgaGuard uses two stable device identifiers because the embedded transport and backend resource models have different constraints.

| Field            | Owner and use                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| `deviceId`       | Immutable canonical `AG-000001` identity used by firmware, OLED, QR, MQTT topics, and MQTT payloads           |
| `deviceUuid`     | Internal UUID used by databases, REST resources, Access Service decisions, and WebSocket device subscriptions |
| `organizationId` | Internal UUID added only by trusted backend services for ownership, authorization, and realtime routing       |

Device Service is the authoritative mapping source. A device, MQTT payload, external header, or caller-supplied extension never establishes `organizationId`, `deviceUuid`, lifecycle status, or `ownershipVersion`.

## Resolution and trust boundary

Authenticated backend services resolve a canonical `deviceId` through Device Service and receive [`device-context-v1`](../schemas/internal/device-context-v1.schema.json). Unknown, unclaimed, inactive, and revoked devices are rejected rather than receiving an accepted context. Context caches must have a short bounded TTL and support lifecycle and ownership invalidation.

The resolved context contains no credentials or claim material. `ownershipVersion` is a monotonically increasing decimal string. Services reject or re-resolve stale ownership versions instead of trusting cached organization data.

## Telemetry enrichment

MQTT remains `algaguard/v1/devices/{deviceId}/telemetry`. Ingestion validates the authenticated device, topic, and payload canonical IDs before resolving trusted context. Device-supplied organization data is rejected.

Telemetry Service persists `deviceUuid`, `deviceId`, `organizationIdAtIngest`, and `ownershipVersionAtIngest`. After the database transaction commits, it publishes [`telemetry-committed-v1`](../schemas/internal/telemetry-committed-v1.schema.json). Realtime validates that event and emits [`telemetry-updated-v1-1`](../schemas/websocket/telemetry-updated-v1-1.schema.json), routing by `organizationId` and `deviceUuid` while retaining `deviceId` for display and support.

## Ownership transfer

Device Service changes `organizationId` atomically, increments `ownershipVersion`, and preserves an audit record. Access decisions and bounded ingestion/realtime caches are invalidated. Existing subscriptions for the old organization are removed. Future telemetry routes only to the new organization.

Historical telemetry retains `organizationIdAtIngest`; transfer does not rewrite history. Access to pre-transfer history is configurable and remains denied by default until an explicit product or audit policy is approved.

## Compatibility and migration

- Released v1 schemas and MQTT semantics are unchanged.
- WebSocket connection tickets and [`client-subscribe-v1`](../schemas/websocket/client-subscribe-v1.schema.json) remain unchanged.
- Device subscription `resourceId` continues to be the internal UUID, now named `deviceUuid` in trusted event context.
- `telemetry.updated` remains the event type.
- `telemetry-updated-v1-1` is a new schema-document minor version used by identity-aware consumers; the original v1 schema remains available.
- No WebSocket v2 endpoint or subscription protocol is introduced.

Consumers must select the schema by its full URN and `schemaVersion`. They must not validate a v1.1 event against the immutable v1 telemetry schema.
