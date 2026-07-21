# MQTT QoS and retained-message policy

| Suffix              | QoS | Retained | Reason                                                                   |
| ------------------- | --: | -------: | ------------------------------------------------------------------------ |
| `telemetry`         |   1 |       no | At-least-once delivery plus application idempotency                      |
| `telemetry/ack`     |   1 |       no | Acknowledges a particular durable ingestion result                       |
| `health`            |   1 |       no | Periodic diagnostics must not masquerade as current after a long outage  |
| `status`            |   1 |      yes | Latest lifecycle state and Last Will must survive reconnects             |
| `commands`          |   1 |       no | Stale commands must not execute after reconnect                          |
| `command-results`   |   1 |       no | Result events are independently durable in the service boundary          |
| `configuration`     |   1 |      yes | The latest desired immutable profile version must arrive after reconnect |
| `configuration/ack` |   1 |       no | Acknowledges one configuration application attempt                       |
| `ota`               |   1 |       no | Stale release notifications must not trigger installation                |
| `ota/status`        |   1 |       no | OTA progress is an event stream, not desired state                       |

QoS 1 permits duplicates. Producers and consumers must implement idempotency using stable IDs and sequences. MQTT PUBACK proves only broker receipt; it is not a telemetry application acknowledgement. See [acknowledgement semantics](acknowledgement-semantics.md).
