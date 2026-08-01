import assert from 'node:assert/strict';
import test from 'node:test';
import { createAjv } from '../scripts/lib/contract-tools.mjs';

const ajv = createAjv();
const invitation = ajv.getSchema('urn:algaguard:schema:onboarding:qr-onboarding-invitation:v1');
const exchange = ajv.getSchema('urn:algaguard:schema:onboarding:qr-onboarding-exchange-request:v1');
const scanFirstExchange = ajv.getSchema(
  'urn:algaguard:schema:onboarding:qr-onboarding-exchange-request:v2',
);
const bleV2 = ajv.getSchema('urn:algaguard:schema:onboarding:ble-provisioning-request:v2');

test('compact public invitation has exact bounded fields', () => {
  assert.equal(
    invitation({
      version: 1,
      deviceId: 'AG-000001',
      nonce: 'AAECAwQFBgcICQoLDA0ODw',
      issuedAt: 1893456000,
      expiresAt: 1893456300,
      capabilityVersion: 1,
      checksum: 43981,
    }),
    true,
  );
  assert.equal(invitation({ version: 1, sessionToken: 'forbidden' }), false);
});

test('exchange accepts only the compact ag scheme and no redirect', () => {
  const value = {
    schema: 'urn:algaguard:schema:onboarding:qr-onboarding-exchange-request:v1',
    schemaVersion: '1.0.0',
    invitationUri: 'ag://q/' + 'A'.repeat(42),
    ownershipVersion: '1',
  };
  assert.equal(exchange(value), true);
  assert.equal(exchange({ ...value, invitationUri: 'https://example.invalid/' }), false);
  assert.equal(exchange({ ...value, redirectUri: 'https://example.invalid/' }), false);
});

test('scan-first exchange requires an authenticated organization binding and exact mode', () => {
  const value = {
    schema: 'urn:algaguard:schema:onboarding:qr-onboarding-exchange-request:v2',
    schemaVersion: '2.0.0',
    invitationUri: 'ag://q/' + 'A'.repeat(42),
    organizationId: '10000000-0000-4000-8000-000000000001',
    registrationMode: 'DEVELOPMENT_SCAN_FIRST',
  };
  assert.equal(scanFirstExchange(value), true);
  assert.equal(scanFirstExchange({ ...value, ownershipVersion: '1' }), false);
  assert.equal(scanFirstExchange({ ...value, registrationMode: 'UNSAFE' }), false);
});

test('BLE v2 requires a signed binding grant and rejects arbitrary fields', () => {
  const value = {
    schema: 'urn:algaguard:schema:onboarding:ble-provisioning-request:v2',
    schemaVersion: '2.0.0',
    sessionId: '30000000-0000-4000-8000-000000000001',
    deviceId: 'AG-000001',
    sessionToken: 'A'.repeat(43),
    bindingGrant: 'A'.repeat(194),
    ssid: 'synthetic-network',
    password: 'synthetic-password',
  };
  assert.equal(bleV2(value), true);
  assert.equal(bleV2({ ...value, nonce: 'not-allowed' }), false);
});
