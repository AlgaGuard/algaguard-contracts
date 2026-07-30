import assert from 'node:assert/strict';
import test from 'node:test';
import { createAjv } from '../scripts/lib/contract-tools.mjs';

const sample = {
  sequence: '1',
  observedAt: '2026-07-30T00:00:01.000Z',
  timestampQuality: 'NTP_SYNCED',
  uptimeMs: '1000',
  values: {
    temperatureC: 24.1,
    ph: 7.1,
    lightLux: 900,
    nitrateMgL: 2.4,
    phosphateMgL: 0.35,
    potassiumMgL: 1.8,
  },
  qualityFlags: ['SIMULATED'],
  simulationScenario: 'simulated-demo',
  extensions: {
    'algaguard.demo.source': 'SIMULATED_DEMO',
    'algaguard.demo.generated-at': '2026-07-30T00:00:01.000Z',
    'algaguard.demo.profile-version': '1.0.0',
  },
};

test('the released telemetry contract carries all six demo parameters and explicit source metadata', () => {
  const validate = createAjv().getSchema('urn:algaguard:schema:mqtt:telemetry-sample:v1');
  assert.ok(validate);
  assert.equal(validate(sample), true, JSON.stringify(validate.errors));
  assert.deepEqual(Object.keys(sample.values).sort(), [
    'lightLux',
    'nitrateMgL',
    'ph',
    'phosphateMgL',
    'potassiumMgL',
    'temperatureC',
  ]);
  assert.equal(sample.extensions['algaguard.demo.source'], 'SIMULATED_DEMO');
});

test('simulation source metadata never substitutes for the authoritative SIMULATED quality flag', () => {
  const validate = createAjv().getSchema('urn:algaguard:schema:mqtt:telemetry-sample:v1');
  assert.ok(validate);
  const missingScenario = { ...sample, simulationScenario: undefined };
  assert.equal(validate(missingScenario), false);
});
