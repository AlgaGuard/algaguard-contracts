# OTA semantics

OTA notification is an expiring, non-retained QoS 1 message. The device must verify all of the following before installation:

- hardware model matches exactly;
- `downloadUrl` and optional release-notes URL use HTTPS;
- downloaded size matches `sizeBytes`;
- SHA-256 matches 64 lowercase hexadecimal characters;
- signature verifies with an approved public key and named algorithm;
- notification is not expired and the rollout ring permits the device.

Private signing keys never appear in contracts, MQTT messages, repositories, or device downloads. Public-key distribution, canonical signed-manifest bytes, signing custody, rollback thresholds, and production approval remain security-review items.

Status covers notification, download, verification, installation, boot validation, success, failure, rollback, and rejection. `FAILED` and `REJECTED` include error detail. `runningVersion` reports what is actually executing rather than the desired version.

These contracts do not claim that OTA is operational; implementation belongs to a later phase.
