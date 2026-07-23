# Versioning policy

MQTT major version is part of the topic path, currently `v1`. Every message also includes `schemaVersion` using semantic versioning.

Published schema files are immutable. A change follows one of these paths:

- Documentation clarification with no wire meaning change: changelog and review; schema version unchanged.
- Compatible optional addition or validation/tool improvement: new schema-document semantic version where distributed, with existing consumers still accepting the wire form.
- Breaking field, type, unit, requiredness, enum, or semantic change: new versioned schema file and, for device wire changes, a new major topic path such as `v2`.

Every contract PR updates examples, tests, documentation, the compatibility matrix, and `CHANGELOG.md`. Breaking changes additionally require an ADR, consumer inventory, migration/coexistence plan, and `breaking-change` label.

For filenames that cannot safely use a semantic-version dot, a minor schema-document revision uses a hyphen, for example `telemetry-updated-v1-1.schema.json` for schema version `1.1.0`. The full URN remains authoritative. A schema-document minor revision does not change the MQTT topic major, WebSocket endpoint, subscription message, resource rule, or event type.
