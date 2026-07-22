# Realtime delivery semantics

Status: Phase 2.1 contract. Consumer and Realtime Service implementation begins in later application phases.

## Delivery model

The Realtime Service receives authorized live update notifications through portable Redis Pub/Sub and fans them out over native RFC 6455 WebSockets. Delivery is best-effort, non-durable, and intended to reduce UI polling latency. It is not an audit log, command queue, telemetry store, or recovery source.

Authoritative services commit state before publishing a live notification. If publication or delivery fails, the committed state remains available through HTTPS. On reconnect, clients recover current state through HTTPS and then resubscribe. Event delivery may be delayed, duplicated, reordered, coalesced, or missed across failures.

## Ordering and duplicates

- `eventId` uniquely identifies a published event and supports bounded client duplicate suppression.
- Optional `sequence` provides resource-specific relative ordering where the producer can supply one.
- No global ordering exists across organizations, devices, services, or event types.
- `occurredAt` describes the source transition time and is not an ordering guarantee.
- Clients ignore stale state by comparing authoritative versions, timestamps, or resource sequences defined by the owning service.

## Flow control and abuse protection

The implementation must enforce and measure:

- heartbeat and idle timeout;
- maximum active subscriptions per connection and authenticated subject;
- maximum inbound and outbound message size;
- inbound control-message rate limits;
- connection and ticket issuance rate limits;
- bounded per-connection outbound queues;
- slow-client detection and backpressure closure; and
- connection, subscription, authorization, publish, drop, queue-depth, error, and reconnect metrics.

Exact values are `TBD` until implementation load tests and the capacity plan supply evidence. Limits must be configurable, documented consistently for clients, and must not be silently relaxed in hosted environments.

## Portability and security

The contract requires WSS outside local development, standard WebSocket framing, Keycloak-backed one-time tickets through the API Gateway, Access Service authorization, and Redis Pub/Sub. It does not require AWS API Gateway WebSocket APIs, AppSync, IoT Core, managed pub/sub, Socket.IO, or provider-specific hostnames.

Commands travel only through authorized HTTPS REST to the API Gateway and Command Service, then through MQTT to the device. WebSocket delivers status changes only and never accepts sensitive commands.
