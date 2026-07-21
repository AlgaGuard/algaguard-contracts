# Security and MQTT ACL

MQTT uses TLS and a distinct per-device credential or certificate identity. Keycloak authenticates human users; device credentials are not Keycloak user tokens. Authorization is enforced before cloud services publish device commands, configuration, acknowledgements, or OTA notifications.

For its own `{deviceId}`, a device may publish only:

- `telemetry`
- `health`
- `status`
- `command-results`
- `configuration/ack`
- `ota/status`

It may subscribe only:

- `telemetry/ack`
- `commands`
- `configuration`
- `ota`

ACLs deny cross-device access and all unspecified topics. Credentials, Wi-Fi values, private keys, signing keys, organization IDs, and personal information are prohibited in topics and payload extensions. Certificate issuance, rotation, revocation, broker ACL syntax, and the real MQTT hostname remain deployment-stage `TBD` items.
