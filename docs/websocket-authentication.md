# WebSocket authentication

Status: Phase 2.1 contract. Endpoint paths, ticket lifetime, and operational limits are `TBD`.

## Connection flow

1. The web or mobile client authenticates with Keycloak using the approved OIDC flow.
2. The client calls an authenticated HTTPS endpoint at the API Gateway and requests a short-lived, one-time WebSocket ticket.
3. The API Gateway validates the Keycloak access token and issues a ticket bound to the authenticated subject and intended WebSocket use.
4. The client opens the WSS endpoint with only the one-time ticket as connection material.
5. The Realtime Service atomically consumes the ticket during the upgrade, establishes the subject context, and refuses invalid, expired, or replayed tickets.
6. The client sends subscription requests. The Realtime Service asks the Access Service to authorize every resource subscription.

The long-lived Keycloak access token must not appear in a query string or WebSocket message. Tickets must be redacted from logs, traces, metrics, error messages, and browser history. WSS is mandatory outside explicitly local development.

## Authorization and revocation

Authentication establishes who the connection represents; it does not grant resource access by itself. The Access Service decides organization, device, and current-user authorization for every requested subscription. A partially valid subscribe request may acknowledge allowed subscriptions and reject denied entries without leaking whether an unrelated resource exists.

Membership, sharing, ownership, or role revocation removes affected active subscriptions promptly. The Realtime Service must not continue delivery from a stale connection-level authorization cache after receiving a revocation signal. Exact cache lifetime and revocation propagation target are `TBD` and require security review.

## Renewal and failure

There is no in-place WebSocket reauthentication. When authentication expires or the server requires reauthentication, the server closes the connection. The client obtains a new one-time ticket over HTTPS, reconnects, recovers authoritative state, and resubscribes. See [reconnection](websocket-reconnection.md).

Protocol errors use [`realtime-error-v1`](../schemas/websocket/realtime-error-v1.schema.json). Authentication failures during the HTTP upgrade use an appropriate HTTP status without returning secrets or distinguishing sensitive internal causes.
