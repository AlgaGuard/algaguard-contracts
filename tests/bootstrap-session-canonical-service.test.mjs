import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import YAML from 'yaml';
import {
  createAjv,
  readJson,
  repositoryRoot,
  validateContract,
} from '../scripts/lib/contract-tools.mjs';

const schemaId = 'urn:algaguard:schema:onboarding:bootstrap-session:v1';
const canonicalServiceUuid = '0000a1a0-0000-1000-8000-00805f9b34fb';
const previousConflictingServiceUuid = 'a19a0001-7e4d-4b1a-9c2d-000000000001';

function validate(value) {
  return validateContract(createAjv(), schemaId, value);
}

test('bootstrap session accepts only the canonical BLE provisioning service UUID', () => {
  const value = readJson(
    path.join(repositoryRoot, 'examples', 'valid', 'bootstrap-session-v1.json'),
  );
  assert.equal(validate(value).valid, true);
  assert.equal(validate({ ...value, serviceUuid: previousConflictingServiceUuid }).valid, false);
  assert.equal(
    validate({ ...value, serviceUuid: '10000000-0000-4000-8000-000000000001' }).valid,
    false,
  );
  const { serviceUuid: _missing, ...withoutServiceUuid } = value;
  assert.equal(validate(withoutServiceUuid).valid, false);
  assert.equal(validate({ ...value, serviceUuid: 'not-a-uuid' }).valid, false);
});

test('JSON Schema and OpenAPI preserve the exact canonical value for generated clients', () => {
  const schema = readJson(
    path.join(repositoryRoot, 'schemas', 'onboarding', 'bootstrap-session-v1.schema.json'),
  );
  const openApi = YAML.parse(
    fs.readFileSync(path.join(repositoryRoot, 'openapi', 'device-service-v1.yaml'), 'utf8'),
  );
  assert.equal(schema.properties.serviceUuid.const, canonicalServiceUuid);
  assert.equal(
    openApi.components.schemas.BootstrapSession.properties.serviceUuid.const,
    canonicalServiceUuid,
  );
});
