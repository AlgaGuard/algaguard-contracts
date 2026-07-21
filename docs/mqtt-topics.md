# MQTT topics

The major wire version is part of every topic. `{deviceId}` matches `^AG-[0-9]{6}$`.

| Topic                                               | Direction       |
| --------------------------------------------------- | --------------- |
| `algaguard/v1/devices/{deviceId}/telemetry`         | device to cloud |
| `algaguard/v1/devices/{deviceId}/telemetry/ack`     | cloud to device |
| `algaguard/v1/devices/{deviceId}/health`            | device to cloud |
| `algaguard/v1/devices/{deviceId}/status`            | device to cloud |
| `algaguard/v1/devices/{deviceId}/commands`          | cloud to device |
| `algaguard/v1/devices/{deviceId}/command-results`   | device to cloud |
| `algaguard/v1/devices/{deviceId}/configuration`     | cloud to device |
| `algaguard/v1/devices/{deviceId}/configuration/ack` | device to cloud |
| `algaguard/v1/devices/{deviceId}/ota`               | cloud to device |
| `algaguard/v1/devices/{deviceId}/ota/status`        | device to cloud |

Topic segments are lowercase ASCII. Credentials, organization identifiers, profile names, and user data never appear in a topic. The ten channels and their payload schemas are machine-described in [AsyncAPI](../asyncapi/algaguard-mqtt-v1.yaml).

The pilot path is ESP32 to EMQX to MQTT Ingestion Service to Telemetry Service. A later bridge may copy validated messages to Kafka, but the device-facing topics remain MQTT and the ESP32 never connects to Kafka.
