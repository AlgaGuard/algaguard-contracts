import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAjv,
  readJson,
  repositoryRoot,
  validateContract,
} from '../scripts/lib/contract-tools.mjs';

const ajv = createAjv();
const examplesRoot = path.join(repositoryRoot, 'examples', 'valid');

test('credential lifecycle has the approved complete state and revocation enums', () => {
  const metadata = readJson(
    path.join(repositoryRoot, 'schemas', 'onboarding', 'device-credential-metadata-v1.schema.json'),
  );
  assert.deepEqual(metadata.$defs.credentialStatus.enum, [
    'PENDING',
    'ACTIVE',
    'ROTATING',
    'REVOKED',
    'EXPIRED',
    'COMPROMISED',
    'FAILED',
  ]);
  assert.deepEqual(metadata.$defs.revocationReason.oneOf[0].enum, [
    'ROTATED',
    'EXPIRED',
    'COMPROMISED',
    'ADMIN_REVOKED',
    'DEVICE_RETIRED',
    'ISSUANCE_ERROR',
    'RECOVERY_REPLACED',
  ]);
});

test('certificate example binds exactly one SAN device UUID and the canonical deviceId', () => {
  const credential = readJson(path.join(examplesRoot, 'device-credential-metadata-v1.json'));
  assert.equal(credential.deviceId, 'AG-000001');
  assert.deepEqual(credential.sanUris, [`urn:algaguard:device:${credential.deviceUuid}`]);
  assert.equal(credential.subjectDistinguishedName, `CN=${credential.deviceId}`);
});

test('rotation overlap is bounded to at most two credential IDs', () => {
  const status = readJson(
    path.join(repositoryRoot, 'schemas', 'onboarding', 'credential-status-v1.schema.json'),
  );
  assert.equal(status.properties.activeCredentialIds.maxItems, 2);
});

test('credential wire contracts expose no private-key property', () => {
  const credentialFiles = [
    'bootstrap-authorization-v1.json',
    'bootstrap-token-exchange-request-v1.json',
    'bootstrap-token-exchange-response-v1.json',
    'credential-csr-submission-v1.json',
    'credential-issuance-v1.json',
    'device-credential-metadata-v1.json',
    'credential-status-v1.json',
    'credential-rotation-request-v1.json',
    'credential-rotation-ack-v1.json',
    'credential-revocation-status-v1.json',
    'credential-health-v1.json',
  ];
  for (const filename of credentialFiles) {
    const value = readJson(path.join(examplesRoot, filename));
    assert.doesNotMatch(JSON.stringify(value), /private[_-]?key|ca[_-]?private/i, filename);
  }
});

test('bootstrap exchange is additive and does not accept caller-supplied organization authority', () => {
  const request = readJson(
    path.join(repositoryRoot, 'examples', 'valid', 'bootstrap-token-exchange-request-v1.json'),
  );
  const response = readJson(
    path.join(repositoryRoot, 'examples', 'valid', 'bootstrap-token-exchange-response-v1.json'),
  );
  assert.equal(
    validateContract(
      ajv,
      'urn:algaguard:schema:onboarding:bootstrap-token-exchange-request:v1',
      request,
    ).valid,
    true,
  );
  assert.equal(
    validateContract(
      ajv,
      'urn:algaguard:schema:onboarding:bootstrap-token-exchange-response:v1',
      response,
    ).valid,
    true,
  );
  const invalid = readJson(
    path.join(
      repositoryRoot,
      'examples',
      'invalid',
      'bootstrap-token-exchange-request-extra-authority.invalid.json',
    ),
  );
  const result = validateContract(
    ajv,
    'urn:algaguard:schema:onboarding:bootstrap-token-exchange-request:v1',
    invalid,
  );
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.keyword === 'additionalProperties'));
});

test('strict CSR schema rejects private key material', () => {
  const value = readJson(
    path.join(repositoryRoot, 'examples', 'invalid', 'credential-private-key.invalid.json'),
  );
  const result = validateContract(
    ajv,
    'urn:algaguard:schema:onboarding:credential-csr-submission:v1',
    value,
  );
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.keyword === 'additionalProperties'));
});

test('additive OpenAPI and AsyncAPI reference the credential schemas', () => {
  const openapi = fs.readFileSync(
    path.join(repositoryRoot, 'openapi', 'device-credential-service-v1.yaml'),
    'utf8',
  );
  const asyncapi = fs.readFileSync(
    path.join(repositoryRoot, 'asyncapi', 'algaguard-device-credential-v1.yaml'),
    'utf8',
  );
  assert.match(openapi, /credential-csr-submission-v1\.schema\.json/);
  assert.match(openapi, /device-credential-metadata-v1\.schema\.json/);
  assert.match(openapi, /bootstrap-token-exchange-request-v1\.schema\.json/);
  assert.match(openapi, /bootstrap-token-exchange-response-v1\.schema\.json/);
  assert.match(openapi, /\/api\/v1\/device-credential-bootstrap\/exchange/);
  assert.match(asyncapi, /credential-rotation-request-v1\.schema\.json/);
  assert.match(asyncapi, /credential-rotation-ack-v1\.schema\.json/);
});
