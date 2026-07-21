# Command semantics

MVP commands are `REQUEST_STATUS`, `SET_INDICATOR_STATE`, `APPLY_PROFILE_CONFIGURATION`, `SYNC_TIME`, `REBOOT`, and `PREPARE_OTA`. Remote factory reset is intentionally absent.

Commands use QoS 1, are not retained, and expire. Authorization is completed before publishing. Devices deduplicate by `commandId`, reject commands after `expiresAt`, and never interpret redelivery as a new request.

`SET_INDICATOR_STATE` sets each red, green, and blue indicator to `ON` or `OFF`; PWM is not supported. Configuration commands carry immutable profile references. `PREPARE_OTA` references an authorized release but does not replace the signed OTA notification.

Results progress through `RECEIVED`, optional `IN_PROGRESS`, and a terminal `SUCCEEDED`, `FAILED`, `REJECTED`, or `EXPIRED` state. Failures and rejections include bounded error detail. Correlation IDs connect the user/API request, command, result, and audit entry.
