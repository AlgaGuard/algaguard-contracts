# Development standards

- JSON properties use `camelCase`; MQTT topic segments use lowercase ASCII and hyphens only where documented.
- Absolute timestamps use UTC RFC 3339. Untrustworthy device time uses explicit `UNSYNCED` semantics.
- Message, batch, command, configuration, profile, release, correlation, and session identifiers use UUIDs where specified.
- Telemetry sequences and long monotonic counters use canonical decimal strings.
- Parameters and units use the canonical names in [units and parameters](units-and-parameters.md).
- QoS 1 consumers are idempotent; application acknowledgements identify durable completion.
- Correlation IDs flow across HTTP, MQTT, service calls, results, and audit events.
- Core payloads are strict. Forward-compatible metadata uses bounded namespaced `extensions`.
- Every contract change updates examples, tests, documentation, compatibility analysis, and `CHANGELOG.md`.
- Breaking changes require a new version, ADR, migration plan, and reviewed `breaking-change` label.
- No AWS-specific domain type, NestJS, Java/Spring MVP implementation, Python service, Firebase dependency, runtime business logic, or deployment implementation belongs here.
