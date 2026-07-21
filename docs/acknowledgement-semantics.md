# Telemetry acknowledgement semantics

## Durable boundary

The MQTT Ingestion Service publishes a telemetry application acknowledgement only after the authoritative Telemetry Service transaction commits both accepted samples and the idempotency record. EMQX PUBACK alone never permits the device to release its SD queue.

The idempotency key is `deviceId + sequence`; `batchId` deduplicates delivery attempts and correlates results.

## Status handling

- `ACCEPTED`: every sample was committed. `acceptedThroughSequence` is the last durable sequence.
- `PARTIALLY_ACCEPTED`: a committed prefix or subset exists. Rejected sequences and errors identify data that must not be silently discarded.
- `REJECTED`: no sequence from the batch was accepted; `acceptedThroughSequence` is `null`.
- `DUPLICATE`: the same logical samples were already committed. The acknowledgement is safe to treat as durable acceptance.

Permanent schema, identity, or range errors are not retried unchanged. Retryable capacity or availability errors may include bounded `retryAfterSeconds`. The device retains unacknowledged records, retries with backoff, and releases only the acknowledged range. Partial rejection requires retaining or quarantining rejected records for diagnostics rather than creating a retry loop.

Lost acknowledgements are expected: replaying a committed batch produces `DUPLICATE` or an equivalent accepted-through result without duplicate logical telemetry.
