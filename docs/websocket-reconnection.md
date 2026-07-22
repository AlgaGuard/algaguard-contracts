# WebSocket reconnection and state recovery

Status: Phase 2.1 contract. Timing constants are `TBD` and must be configured and load-tested during implementation.

Redis Pub/Sub and WebSocket delivery are non-durable. A client must assume it missed events whenever a connection is interrupted, even when event identifiers and sequences appear continuous.

## Required recovery sequence

```text
disconnect
  -> exponential backoff with jitter
  -> obtain a new one-time ticket over authenticated HTTPS
  -> reconnect using WSS
  -> recover authoritative current state over HTTPS
  -> resubscribe to authorized resources and event types
```

The client must not reuse the prior one-time ticket or assume old subscription identifiers remain valid. HTTPS recovery occurs before live updates are treated as a complete view. Clients reconcile by stable resource identifiers and may use `eventId` for bounded duplicate suppression and `sequence` for local ordering where supplied.

## Backoff and liveness

- Reconnect uses capped exponential backoff with jitter to avoid a reconnect storm.
- The server and client use protocol ping/pong or the documented JSON ping message for heartbeat monitoring.
- Either side closes an idle or unresponsive connection after its configured timeout.
- A server restart, deployment, authentication expiry, authorization change, or backpressure close follows the same recovery sequence.

Initial delay, multiplier, maximum delay, heartbeat interval, pong deadline, and idle timeout are deliberately `TBD`. Implementations must publish consistent values, expose metrics, and test reconnect bursts before production claims.

## No replay cursor

Phase 2.1 defines no WebSocket replay or durable cursor. If later requirements need ordered replay, that is a new contract and architecture decision. Redis Pub/Sub must not be described as a durable log. Existing PostgreSQL, TimescaleDB, and service-owned stores remain authoritative.
