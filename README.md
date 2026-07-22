# AlgaGuard contracts

Authoritative, versioned HTTP, MQTT, and WebSocket contracts for the AlgaGuard microalgae monitoring platform. This repository defines interfaces shared by firmware, EMQX, Node.js services, React and Flutter clients, and later Kafka consumers; it contains no runtime implementation.

The architecture and ownership decisions originate in [`algaguard-docs`](https://github.com/AlgaGuard/algaguard-docs). This repository makes those decisions machine-validatable without coupling them to AWS or the final campus host.

## Contract catalog

- [JSON Schema catalog](docs/contract-catalog.md)
- [MQTT topics](docs/mqtt-topics.md) and [QoS/retain policy](docs/mqtt-qos-retain.md)
- [Application acknowledgement semantics](docs/acknowledgement-semantics.md)
- [OpenAPI 3.1 specifications](openapi/)
- [AsyncAPI MQTT specification](asyncapi/algaguard-mqtt-v1.yaml)
- [AsyncAPI WebSocket specification](asyncapi/algaguard-websocket-v1.yaml)
- [WebSocket protocol](docs/websocket-protocol.md), [authentication](docs/websocket-authentication.md), [subscriptions](docs/websocket-subscriptions.md), [reconnection](docs/websocket-reconnection.md), and [delivery semantics](docs/realtime-delivery-semantics.md)
- [Versioning](docs/versioning-policy.md), [compatibility](docs/compatibility-policy.md), and [deprecation](docs/deprecation-policy.md)

## MQTT summary

All device topics use `algaguard/v1/devices/{deviceId}/...`, MQTT over TLS, QoS 1, and per-device identity. Telemetry uses an application acknowledgement after the authoritative telemetry-store transaction commits. Status and desired configuration are retained; commands and OTA notifications are not retained.

The pilot path is ESP32 to EMQX to MQTT Ingestion Service to Telemetry Service. Kafka remains a later scale option, and the ESP32 never connects directly to Kafka.

## WebSocket summary

Web and mobile clients obtain a short-lived, one-time WebSocket ticket from the API Gateway over authenticated HTTPS, connect using WSS, and request organization, device, or current-user subscriptions. The Access Service authorizes every subscription and revocation removes active access. Redis Pub/Sub provides non-durable live fan-out; clients recover authoritative state over HTTPS after reconnecting.

WebSocket carries live status only. Commands always enter through authorized HTTPS REST, continue through the Command Service and MQTT, and report progress through `command.status.changed`. Exact connection, heartbeat, subscription, size, and rate limits are `TBD` pending implementation evidence.

## Setup and validation

Requirements: Node.js 22 LTS or a later compatible LTS and npm.

```sh
npm ci
npm run check
```

Individual commands are available for formatting, Markdown/OpenAPI linting, schema and example validation, OpenAPI, AsyncAPI, reference checks, tests, and obvious breaking-change checks. See [`package.json`](package.json).

## Change process

Compatible additions require updated schemas, examples, tests, documentation, and `CHANGELOG.md`. Released schema files are immutable; create a new versioned file instead of editing one in place.

Breaking wire changes require an ADR, the `breaking-change` label, consumer impact analysis, migration guidance, and a new major MQTT path such as `v2`. See the [compatibility policy](docs/compatibility-policy.md).

## Repository tree

```text
.github/       Review templates, ownership, and contract-validation CI
schemas/       Draft 2020-12 common, MQTT, and WebSocket JSON Schemas
openapi/       OpenAPI 3.1 service contracts
asyncapi/      MQTT and WebSocket AsyncAPI contracts
examples/      Valid and deliberately invalid contract examples
docs/          Semantics, policies, standards, and compatibility matrix
scripts/       Node.js validation and compatibility tools
tests/         Contract, example, topic, and compatibility tests
```

## Phase status

Phase 2 contract foundation is complete and merged into develop. Phase 2.1 adds the portable WebSocket contract amendment. Consumer implementation, the planned `algaguard-realtime-service`, and physical-device validation begin in later application phases.

This status describes the intended Phase 2 completion state and must only be used after the feature pull request is merged. The contracts do not claim that firmware, services, MQTT ACLs, or OTA are deployed.

Scientific algae thresholds remain unapproved. Profile examples are simulation-only and are not scientific advice. Phase 3 has not started.
