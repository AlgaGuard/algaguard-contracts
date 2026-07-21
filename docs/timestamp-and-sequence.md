# Timestamp and sequence

All absolute timestamps are UTC RFC 3339 strings. Consumers preserve the supplied `timestampQuality`:

- `NTP_SYNCED`: device time was recently synchronized by NTP.
- `RTC_HOLDOVER`: the RTC is supplying UTC after a previously trustworthy synchronization.
- `UNSYNCED`: no trustworthy UTC observation time exists.

An `UNSYNCED` telemetry sample omits `observedAt`; it still includes a decimal-string `sequence` and decimal-string monotonic `uptimeMs`. Consumers order it within the device stream but must not invent UTC. Synced and holdover samples require `observedAt`.

Sequences are canonical base-10 strings without a sign or leading zero, except the value `0`. They are bounded to unsigned 64-bit values. This avoids precision loss in JavaScript while remaining practical for C/C++ and Dart.

Sequence continuity is evaluated per device. Reboots do not silently reuse sequence values; persistent sequence state and explicit session diagnostics are implementation responsibilities in later phases.
