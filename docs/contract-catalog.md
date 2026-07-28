# Contract catalog

All schemas use JSON Schema Draft 2020-12 and stable URN identifiers. Files ending in `-v1` are immutable after release; compatible schema-document revisions retain wire compatibility and breaking changes create a new major file and topic path.

## Common schemas

| Contract                                                                     | Purpose                                                                                                                            |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [`event-envelope-v1`](../schemas/common/event-envelope-v1.schema.json)       | Common schema identity, semantic version, message UUID, device scope, UTC send time, correlation, tracing, extensions, and payload |
| [`timestamp-quality-v1`](../schemas/common/timestamp-quality-v1.schema.json) | `NTP_SYNCED`, `RTC_HOLDOVER`, or `UNSYNCED`                                                                                        |
| [`error-detail-v1`](../schemas/common/error-detail-v1.schema.json)           | Bounded machine and human error detail                                                                                             |
| [`device-reference-v1`](../schemas/common/device-reference-v1.schema.json)   | Bounded `AG-000001` device identity                                                                                                |
| [`device-identity-v1`](../schemas/common/device-identity-v1.schema.json)     | Trusted dual identity, organization, lifecycle, and ownership-version fields                                                       |
| [`profile-reference-v1`](../schemas/common/profile-reference-v1.schema.json) | Immutable UUID and semantic profile version                                                                                        |
| [`parameter-values-v1`](../schemas/common/parameter-values-v1.schema.json)   | Canonical telemetry names and transport units                                                                                      |
| [`extension-map-v1`](../schemas/common/extension-map-v1.schema.json)         | Namespaced forward-compatible metadata                                                                                             |

## MQTT schemas

| Contract                                                                                   | Direction and purpose                                           |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| [`telemetry-sample-v1`](../schemas/mqtt/telemetry-sample-v1.schema.json)                   | Embedded one-second observation                                 |
| [`telemetry-batch-v1`](../schemas/mqtt/telemetry-batch-v1.schema.json)                     | Device to cloud batch, normally about ten samples               |
| [`telemetry-ack-v1`](../schemas/mqtt/telemetry-ack-v1.schema.json)                         | Cloud to device durable application acknowledgement             |
| [`device-health-v1`](../schemas/mqtt/device-health-v1.schema.json)                         | Device diagnostics and capacity                                 |
| [`device-status-v1`](../schemas/mqtt/device-status-v1.schema.json)                         | Retained lifecycle and Last Will state                          |
| [`profile-configuration-v1`](../schemas/mqtt/profile-configuration-v1.schema.json)         | Retained desired profile version and thresholds                 |
| [`profile-configuration-ack-v1`](../schemas/mqtt/profile-configuration-ack-v1.schema.json) | Device application result for desired configuration             |
| [`command-v1`](../schemas/mqtt/command-v1.schema.json)                                     | Authorized, expiring MVP command                                |
| [`command-result-v1`](../schemas/mqtt/command-result-v1.schema.json)                       | Device command lifecycle result                                 |
| [`ota-notification-v1`](../schemas/mqtt/ota-notification-v1.schema.json)                   | Signed, expiring firmware release notification                  |
| [`ota-status-v1`](../schemas/mqtt/ota-status-v1.schema.json)                               | Device download, verification, installation, and rollback state |

## Onboarding schemas

| Contract                                                                                                                       | Direction and purpose                                              |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [`claim-qr-v1`](../schemas/onboarding/claim-qr-v1.schema.json)                                                                 | Compact OLED QR and manual fallback claim material                 |
| [`bootstrap-session-v1`](../schemas/onboarding/bootstrap-session-v1.schema.json)                                               | HTTPS-issued short-lived, one-device BLE bootstrap session         |
| [`ble-provisioning-request-v1`](../schemas/onboarding/ble-provisioning-request-v1.schema.json)                                 | Protected-session Wi-Fi provisioning request from mobile to device |
| [`ble-provisioning-result-v1`](../schemas/onboarding/ble-provisioning-result-v1.schema.json)                                   | Credential-free provisioning progress from device to mobile        |
| [`physical-session-handoff-start-request-v1`](../schemas/onboarding/physical-session-handoff-start-request-v1.schema.json)     | Development-only local handoff start binding                       |
| [`physical-session-handoff-start-response-v1`](../schemas/onboarding/physical-session-handoff-start-response-v1.schema.json)   | One-time device and user approval codes                            |
| [`physical-session-handoff-approve-request-v1`](../schemas/onboarding/physical-session-handoff-approve-request-v1.schema.json) | Authenticated mobile approval with session proof                   |
| [`physical-session-handoff-redeem-request-v1`](../schemas/onboarding/physical-session-handoff-redeem-request-v1.schema.json)   | Device-code redemption request                                     |
| [`physical-session-handoff-redeem-response-v1`](../schemas/onboarding/physical-session-handoff-redeem-response-v1.schema.json) | Pending, rejected, or one-time redeemed bundle                     |

## WebSocket schemas

| Contract                                                                                                | Direction and purpose                                                                              |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [`realtime-envelope-v1`](../schemas/websocket/realtime-envelope-v1.schema.json)                         | Server event identity, type, UTC occurrence time, resource context, optional ordering, and payload |
| [`client-subscribe-v1`](../schemas/websocket/client-subscribe-v1.schema.json)                           | Client request for authorized organization, device, or current-user event delivery                 |
| [`client-unsubscribe-v1`](../schemas/websocket/client-unsubscribe-v1.schema.json)                       | Client removal of connection-scoped subscriptions                                                  |
| [`subscription-ack-v1`](../schemas/websocket/subscription-ack-v1.schema.json)                           | Server acceptance and rejection results for a subscription request                                 |
| [`realtime-error-v1`](../schemas/websocket/realtime-error-v1.schema.json)                               | Bounded authentication, authorization, validation, capacity, and service errors                    |
| [`telemetry-updated-v1`](../schemas/websocket/telemetry-updated-v1.schema.json)                         | Latest accepted telemetry update                                                                   |
| [`telemetry-updated-v1-1`](../schemas/websocket/telemetry-updated-v1-1.schema.json)                     | Identity-aware telemetry update using the unchanged v1 connection and subscription protocol        |
| [`device-health-updated-v1`](../schemas/websocket/device-health-updated-v1.schema.json)                 | Validated device health update                                                                     |
| [`device-status-changed-v1`](../schemas/websocket/device-status-changed-v1.schema.json)                 | Device lifecycle status change                                                                     |
| [`alert-updated-v1`](../schemas/websocket/alert-updated-v1.schema.json)                                 | Alert creation and lifecycle update                                                                |
| [`command-status-changed-v1`](../schemas/websocket/command-status-changed-v1.schema.json)               | Status of a command submitted through HTTPS REST                                                   |
| [`profile-configuration-changed-v1`](../schemas/websocket/profile-configuration-changed-v1.schema.json) | Profile configuration change or device application result                                          |
| [`ota-status-changed-v1`](../schemas/websocket/ota-status-changed-v1.schema.json)                       | OTA rollout and device status update                                                               |

## Internal schemas

| Contract                                                                           | Purpose                                                                                |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [`device-context-v1`](../schemas/internal/device-context-v1.schema.json)           | Authenticated Device Service mapping response                                          |
| [`telemetry-committed-v1`](../schemas/internal/telemetry-committed-v1.schema.json) | Post-commit telemetry event with trusted organization and dual device identity context |

The [MQTT policy](mqtt-topics.md), [device identity context](device-identity-context.md), [WebSocket protocol](websocket-protocol.md), [OpenAPI files](../openapi/), [MQTT AsyncAPI](../asyncapi/algaguard-mqtt-v1.yaml), [WebSocket v1 AsyncAPI](../asyncapi/algaguard-websocket-v1.yaml), and [WebSocket v1.1 identity extension](../asyncapi/algaguard-websocket-v1-1.yaml) are part of the same reviewed contract surface.
