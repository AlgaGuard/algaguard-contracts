# Telemetry semantics

The device normally creates one sample each second and uploads a batch about every ten seconds. Normal batches therefore contain about ten samples. This is an operating cadence, not a requirement that rejects legitimate timing jitter.

Replay batches are explicitly marked and limited to 120 samples, representing at most about two minutes at the normal cadence. Implementations must also enforce their configured MQTT packet-size limit.

For every batch:

- `sampleCount` equals `samples.length`;
- sequences are unsigned decimal strings and strictly increase;
- `firstSequence` and `lastSequence` equal the first and last sample sequences;
- sequence values fit an unsigned 64-bit integer;
- `activeProfile` identifies the immutable profile version used on the device;
- `isReplay` and `createdFromSd` describe recovery without changing data meaning.

JSON has no representation for NaN or Infinity, and producers must not encode them as strings. A missing sensor value is omitted and accompanied by `SENSOR_UNAVAILABLE`; it is not replaced by zero. Simulation data includes `SIMULATED` and a bounded `simulationScenario`. A sample from real sensors is flagged `REAL` when every reading used is fresh, or `DEGRADED` when at least one field fell back to its last-known-good value for that tick.

`nitrateMgL`, `phosphateMgL` and `potassiumMgL` are model estimates computed on the device from the same sample's pH (nitrate, phosphate) and temperature (potassium); they are never measurements. Phosphate and potassium are experimental: the models were trained on a public dataset in which phosphate is a linear function of nitrate and potassium a function of temperature, so consumers must label them as experimental wherever they are shown. A device omits an estimate when its input reading is outside the model's training range (pH 6.89–9.55, temperature 15.9–36.8 °C) rather than extrapolating.
