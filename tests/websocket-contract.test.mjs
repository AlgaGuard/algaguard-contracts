import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import {
  createAjv,
  readJson,
  repositoryRoot,
  validateContract,
} from '../scripts/lib/contract-tools.mjs';

const expectedEventTypes = [
  'telemetry.updated',
  'device.health.updated',
  'device.status.changed',
  'alert.created',
  'alert.updated',
  'command.status.changed',
  'profile.configuration.changed',
  'profile.configuration.applied',
  'ota.status.changed',
  'system.notification',
];

const asyncApiSource = fs.readFileSync(
  path.join(repositoryRoot, 'asyncapi', 'algaguard-websocket-v1.yaml'),
  'utf8',
);
const asyncApi = YAML.parse(asyncApiSource);
const envelope = readJson(
  path.join(repositoryRoot, 'schemas', 'websocket', 'realtime-envelope-v1.schema.json'),
);

test('the realtime envelope publishes exactly the approved event types', () => {
  assert.deepEqual(envelope.$defs.eventType.enum, expectedEventTypes);
});

test('AsyncAPI exposes subscribe, unsubscribe, ping, responses, and every server event family', () => {
  assert.deepEqual(Object.keys(asyncApi.channels.clientMessages.messages), [
    'subscribe',
    'unsubscribe',
    'ping',
  ]);
  const serverMessages = Object.keys(asyncApi.channels.serverMessages.messages);
  for (const message of [
    'subscriptionAck',
    'realtimeError',
    'pong',
    'telemetryUpdated',
    'deviceHealthUpdated',
    'deviceStatusChanged',
    'alertUpdated',
    'commandStatusChanged',
    'profileConfigurationChanged',
    'otaStatusChanged',
    'systemNotification',
  ]) {
    assert.ok(serverMessages.includes(message), message);
  }
});

test('AsyncAPI uses the portable WSS placeholder and one-time ticket', () => {
  assert.equal(asyncApi.servers.production.protocol, 'wss');
  assert.equal(asyncApi.servers.production.host, 'api.algaguard.example');
  assert.equal(asyncApi.servers.production.pathname, '/realtime');
  assert.equal(asyncApi.components.securitySchemes.oneTimeTicket.in, 'query');
  assert.doesNotMatch(asyncApiSource, /amazonaws|execute-api|socket\.io/i);
});

test('an optional namespaced extension remains compatible', () => {
  const event = readJson(
    path.join(repositoryRoot, 'examples', 'valid', 'websocket-telemetry-updated-v1.json'),
  );
  event.extensions = { 'client.algaguard.example': { displayHint: 'latest' } };
  const result = validateContract(
    createAjv(),
    'urn:algaguard:schema:websocket:telemetry-updated:v1',
    event,
  );
  assert.equal(result.valid, true, JSON.stringify(result.errors, null, 2));
});

test('the unauthorized-subscription error has a valid portable representation', () => {
  const error = readJson(
    path.join(
      repositoryRoot,
      'examples',
      'valid',
      'websocket-unauthorized-subscription-error-v1.json',
    ),
  );
  const result = validateContract(
    createAjv(),
    'urn:algaguard:schema:websocket:realtime-error:v1',
    error,
  );
  assert.equal(result.valid, true, JSON.stringify(result.errors, null, 2));
  assert.equal(error.code, 'UNAUTHORIZED_SUBSCRIPTION');
});

test('documentation preserves HTTPS commands and non-durable recovery', () => {
  const protocol = fs.readFileSync(
    path.join(repositoryRoot, 'docs', 'websocket-protocol.md'),
    'utf8',
  );
  const recovery = fs.readFileSync(
    path.join(repositoryRoot, 'docs', 'websocket-reconnection.md'),
    'utf8',
  );
  const delivery = fs.readFileSync(
    path.join(repositoryRoot, 'docs', 'realtime-delivery-semantics.md'),
    'utf8',
  );
  assert.match(protocol, /Commands are always submitted using authorized HTTPS REST/);
  assert.match(recovery, /recover authoritative current state over HTTPS/);
  assert.match(delivery, /best-effort, non-durable/);
  assert.match(delivery, /Redis Pub\/Sub/);
});
