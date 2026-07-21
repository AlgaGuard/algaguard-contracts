# Contract catalog

All schemas use JSON Schema Draft 2020-12 and stable URN identifiers. Files ending in `-v1` are immutable after release; compatible schema-document revisions retain wire compatibility and breaking changes create a new major file and topic path.

## Common schemas

| Contract                                                                     | Purpose                                                                                                                            |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [`event-envelope-v1`](../schemas/common/event-envelope-v1.schema.json)       | Common schema identity, semantic version, message UUID, device scope, UTC send time, correlation, tracing, extensions, and payload |
| [`timestamp-quality-v1`](../schemas/common/timestamp-quality-v1.schema.json) | `NTP_SYNCED`, `RTC_HOLDOVER`, or `UNSYNCED`                                                                                        |
| [`error-detail-v1`](../schemas/common/error-detail-v1.schema.json)           | Bounded machine and human error detail                                                                                             |
| [`device-reference-v1`](../schemas/common/device-reference-v1.schema.json)   | Bounded `AG-000001` device identity                                                                                                |
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

The [MQTT policy](mqtt-topics.md), [OpenAPI files](../openapi/), and [AsyncAPI file](../asyncapi/algaguard-mqtt-v1.yaml) are part of the same reviewed contract surface.
