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

test('owned-device bootstrap reissue request is strict and versioned', () => {
  const ajv = createAjv();
  const value = readJson(
    path.join(
      repositoryRoot,
      'examples',
      'valid',
      'owned-device-bootstrap-reissue-request-v1.json',
    ),
  );
  const result = validateContract(
    ajv,
    'urn:algaguard:schema:onboarding:owned-device-bootstrap-reissue-request:v1',
    value,
  );
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(
    validateContract(
      ajv,
      'urn:algaguard:schema:onboarding:owned-device-bootstrap-reissue-request:v1',
      { ...value, sessionToken: 'must-not-be-accepted' },
    ).valid,
    false,
  );
});

test('device API publishes authenticated no-store bootstrap reissue semantics', () => {
  const document = YAML.parse(
    fs.readFileSync(path.join(repositoryRoot, 'openapi', 'device-service-v1.yaml'), 'utf8'),
  );
  const operation = document.paths['/api/v1/devices/{deviceUuid}/bootstrap-sessions/reissue'].post;
  assert.equal(operation.operationId, 'reissueOwnedDeviceBootstrapSession');
  assert.equal(operation.responses['201'].headers['Cache-Control'].schema.const, 'no-store');
  assert.equal(
    operation.requestBody.content['application/json'].schema.$ref,
    '#/components/schemas/OwnedDeviceBootstrapReissueRequest',
  );
  assert.equal(
    operation.responses['201'].content['application/json'].schema.$ref,
    '#/components/schemas/BootstrapSession',
  );
});
