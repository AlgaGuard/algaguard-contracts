# Profile configuration

Profiles have immutable semantic versions. Desired configuration is retained on the device-specific configuration topic so the newest assignment arrives after reconnect. The device validates it, stores the last valid version, and reports an application acknowledgement.

All six canonical environmental parameters are present. Each declares `enabled`, its fixed canonical `unit`, and optional one-sided or two-sided warning and critical thresholds.

When comparable bounds are supplied, ordering is:

```text
criticalLow <= warningLow <= warningHigh <= criticalHigh
```

Omitted sides are valid. Structural validation does not constitute scientific approval. Examples use `simulationOnly: true`; no default species thresholds are defined.

`configurationHash` is the lowercase SHA-256 of the canonical configuration representation defined by the producing service. Canonicalization details beyond stable field ordering and UTF-8 remain `TBD` before multi-language hash generation is implemented.

An `APPLIED` or `ALREADY_APPLIED` acknowledgement includes the active hash and application time. `REJECTED` includes validation errors. `DEFERRED` means the desired version remains pending. Historical telemetry and alerts retain the profile ID and version used at observation/evaluation time.
