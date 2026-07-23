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

function validExample(name) {
  return readJson(path.join(repositoryRoot, 'examples', 'valid', name));
}

test('trusted identity fixtures share one canonical and internal resource identity', () => {
  const identity = validExample('device-identity-v1.json');
  const context = validExample('internal-device-context-v1.json');
  const committed = validExample('internal-telemetry-committed-v1.json');
  const realtime = validExample('websocket-telemetry-updated-v1-1.json');
  const subscribe = validExample('websocket-subscribe-v1.json');

  for (const value of [context, committed, realtime]) {
    assert.equal(value.deviceUuid, identity.deviceUuid);
    assert.equal(value.deviceId, identity.deviceId);
    assert.equal(value.organizationId, identity.organizationId);
  }
  assert.equal(committed.ownershipVersion, identity.ownershipVersion);
  assert.equal(
    subscribe.subscriptions.find((value) => value.resourceType === 'device').resourceId,
    identity.deviceUuid,
  );
});

test('all additive identity examples validate by their published URNs', () => {
  const ajv = createAjv();
  for (const [name, schema] of [
    ['device-identity-v1.json', 'urn:algaguard:schema:common:device-identity:v1'],
    ['internal-device-context-v1.json', 'urn:algaguard:schema:internal:device-context:v1'],
    [
      'internal-telemetry-committed-v1.json',
      'urn:algaguard:schema:internal:telemetry-committed:v1',
    ],
    [
      'websocket-telemetry-updated-v1-1.json',
      'urn:algaguard:schema:websocket:telemetry-updated:v1-1',
    ],
  ]) {
    const result = validateContract(ajv, schema, validExample(name));
    assert.equal(result.valid, true, `${name}: ${JSON.stringify(result.errors)}`);
  }
});

test('WebSocket v1.1 keeps the v1 endpoint and subscribe contract', () => {
  const source = fs.readFileSync(
    path.join(repositoryRoot, 'asyncapi', 'algaguard-websocket-v1-1.yaml'),
    'utf8',
  );
  const document = YAML.parse(source);
  assert.equal(document.info.version, '1.1.0');
  assert.equal(document.servers.production.pathname, '/realtime');
  assert.equal(
    document.components.messages.subscribe.payload.$ref,
    '../schemas/websocket/client-subscribe-v1.schema.json',
  );
  assert.equal(
    document.components.messages.telemetryUpdated.payload.$ref,
    '../schemas/websocket/telemetry-updated-v1-1.schema.json',
  );
});
