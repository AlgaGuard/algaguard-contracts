# WebSocket subscriptions

Status: Phase 2.1 contract. Maximum subscriptions and rate limits are `TBD` operational configuration.

## Resource scopes

Clients subscribe explicitly after the WebSocket connection is authenticated.

| Resource type  | Identifier                 | Intended scope                             |
| -------------- | -------------------------- | ------------------------------------------ |
| `organization` | Required organization UUID | Authorized organization events             |
| `device`       | Required device UUID       | Authorized events for one device           |
| `current-user` | Omitted                    | Events addressed to the authenticated user |

Each subscription lists one or more published event types. The Realtime Service sends only the intersection of requested event types and Access Service authorization. Broad resource access must not be inferred from the fact that a client knows a UUID.

## Subscribe processing

1. Validate [`client-subscribe-v1`](../schemas/websocket/client-subscribe-v1.schema.json), message size, and rate limits.
2. Evaluate every requested subscription through the Access Service.
3. Allocate an opaque UUID `subscriptionId` for each accepted entry.
4. Return [`subscription-ack-v1`](../schemas/websocket/subscription-ack-v1.schema.json) with accepted and rejected results.
5. Begin live delivery only after authorization succeeds.

The client may retry a request with a new `requestId`. Subscription identifiers live only for the connection and are not durable cursors. The service may deduplicate equivalent requests, but exact idempotency-cache behavior is `TBD`.

## Unsubscribe and revocation

[`client-unsubscribe-v1`](../schemas/websocket/client-unsubscribe-v1.schema.json) removes the listed connection-scoped subscription identifiers. Disconnect removes all subscriptions. Access revocation also removes affected active subscriptions without waiting for the client to unsubscribe.

Unauthorized requests use `UNAUTHORIZED_SUBSCRIPTION`; invalid resource shapes use `INVALID_SUBSCRIPTION`. Responses must not reveal organization membership, device ownership, or other sensitive resource facts.

## Event-source mapping

| Realtime event                   | Authoritative producer or source                                            |
| -------------------------------- | --------------------------------------------------------------------------- |
| `telemetry.updated`              | Telemetry Service after accepted storage/update                             |
| `device.health.updated`          | Device Service from validated ingestion state                               |
| `device.status.changed`          | Device Service from validated status and Last Will state                    |
| `alert.created`, `alert.updated` | Alert Service after durable alert transition                                |
| `command.status.changed`         | Command Service after durable command transition or validated device result |
| `profile.configuration.changed`  | Profile Service after durable configuration change                          |
| `profile.configuration.applied`  | Command/Profile flow after validated device acknowledgement                 |
| `ota.status.changed`             | OTA Service after durable rollout status update                             |
| `system.notification`            | Notification Service for current-user or organization notices               |

The Realtime Service does not become a system of record for any of these states.
