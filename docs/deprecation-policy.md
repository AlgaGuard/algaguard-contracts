# Deprecation policy

Deprecation is announced in the changelog, affected schemas/specifications, migration guidance, and repository issues. Producers and consumers receive a coexistence period before removal.

The minimum deprecation duration is `TBD` until release cadence and support commitments are approved. Until then, no published contract may be removed based only on elapsed time.

A deprecation plan records owners, affected consumers, telemetry for remaining usage, replacement version, migration tests, rollback, and final removal approval. Breaking MQTT versions use separate topic paths during coexistence.
