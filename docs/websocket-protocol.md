# WebSocket realtime protocol

Status: Phase 2.1 contract. Consumer implementation begins in later application phases.

AlgaGuard uses portable RFC 6455 WebSockets for authenticated, server-to-client live updates. HTTPS remains authoritative for initial state, recovery, queries, and every command submission. MQTT remains the device transport. WebSocket clients never connect to EMQX or Kafka.

## Endpoint and framing

- Production connections use WSS. Plain WS is permitted only for an explicitly local development environment.
- The contract placeholder is `wss://api.algaguard.example/realtime`; the real product domain is `TBD`.
- Messages are UTF-8 JSON text frames conforming to the versioned schemas in [`schemas/websocket`](../schemas/websocket/).
- The API Gateway issues a short-lived, one-time connection ticket over HTTPS. A Keycloak access token is not placed in the WebSocket URL.
- A ticket is consumed during the upgrade and cannot be replayed. Ticket lifetime and ticket endpoint path are `TBD` implementation configuration.

## Client messages

| Message     | Purpose                                                                       | Contract                                                                          |
| ----------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Subscribe   | Request events for authorized organization, device, or current-user resources | [`client-subscribe-v1`](../schemas/websocket/client-subscribe-v1.schema.json)     |
| Unsubscribe | Remove active subscription identifiers                                        | [`client-unsubscribe-v1`](../schemas/websocket/client-unsubscribe-v1.schema.json) |
| Ping        | Maintain liveness and receive a correlated JSON pong                          | Inline in the [AsyncAPI document](../asyncapi/algaguard-websocket-v1.yaml)        |

Subscribe and unsubscribe requests carry a UUID `requestId`. The server correlates a [`subscription-ack-v1`](../schemas/websocket/subscription-ack-v1.schema.json) or [`realtime-error-v1`](../schemas/websocket/realtime-error-v1.schema.json) response with that request where applicable.

## Server event envelope

Every domain event uses [`realtime-envelope-v1`](../schemas/websocket/realtime-envelope-v1.schema.json):

- `schema` and `schemaVersion` identify the concrete contract;
- `eventId` is a UUID suitable for client-side duplicate suppression;
- `eventType` is one of the published event types;
- `occurredAt` is an ISO 8601 UTC instant ending in `Z`;
- optional decimal-string `sequence` supports ordering without unsafe 64-bit JSON numbers;
- optional `correlationId`, `organizationId`, and `deviceId` preserve request and resource context;
- `payload` holds the typed event body; and
- optional namespaced `extensions` allow compatible metadata additions and must contain no secrets.

The server event types are:

```text
telemetry.updated
device.health.updated
device.status.changed
alert.created
alert.updated
command.status.changed
profile.configuration.changed
profile.configuration.applied
ota.status.changed
system.notification
```

`alert.created` and `alert.updated` share the alert schema. The two profile configuration events share the profile configuration lifecycle schema. `system.notification` uses the generic envelope because its payload is intentionally application-specific and additive.

## Command boundary

Commands are always submitted using authorized HTTPS REST through the API Gateway to the Command Service. The Command Service publishes the approved device command over MQTT. WebSocket carries only `command.status.changed` results. Sensitive or state-changing commands must never be accepted over the WebSocket control-message channel.

See [authentication](websocket-authentication.md), [subscriptions](websocket-subscriptions.md), [reconnection](websocket-reconnection.md), [delivery semantics](realtime-delivery-semantics.md), and the [WebSocket AsyncAPI specification](../asyncapi/algaguard-websocket-v1.yaml).
