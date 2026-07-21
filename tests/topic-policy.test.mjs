import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { repositoryRoot } from '../scripts/lib/contract-tools.mjs';

const expected = {
  telemetry: ['algaguard/v1/devices/{deviceId}/telemetry', 'send', 1, false],
  telemetryAck: ['algaguard/v1/devices/{deviceId}/telemetry/ack', 'receive', 1, false],
  health: ['algaguard/v1/devices/{deviceId}/health', 'send', 1, false],
  status: ['algaguard/v1/devices/{deviceId}/status', 'send', 1, true],
  commands: ['algaguard/v1/devices/{deviceId}/commands', 'receive', 1, false],
  commandResults: ['algaguard/v1/devices/{deviceId}/command-results', 'send', 1, false],
  configuration: ['algaguard/v1/devices/{deviceId}/configuration', 'receive', 1, true],
  configurationAck: ['algaguard/v1/devices/{deviceId}/configuration/ack', 'send', 1, false],
  ota: ['algaguard/v1/devices/{deviceId}/ota', 'receive', 1, false],
  otaStatus: ['algaguard/v1/devices/{deviceId}/ota/status', 'send', 1, false],
};

const asyncApi = YAML.parse(
  fs.readFileSync(path.join(repositoryRoot, 'asyncapi', 'algaguard-mqtt-v1.yaml'), 'utf8'),
);
const mqttDocs = fs.readFileSync(path.join(repositoryRoot, 'docs', 'mqtt-topics.md'), 'utf8');

test('AsyncAPI contains exactly the ten canonical channel addresses', () => {
  assert.equal(Object.keys(asyncApi.channels).length, 10);
  assert.deepEqual(
    new Set(Object.values(asyncApi.channels).map((channel) => channel.address)),
    new Set(Object.values(expected).map(([address]) => address)),
  );
});

test('operation direction, QoS, and retain match the device-perspective policy', () => {
  for (const [name, [, action, qos, retain]] of Object.entries(expected)) {
    const operation = asyncApi.operations[name];
    assert.equal(operation.action, action, name);
    assert.equal(operation.bindings.mqtt.qos, qos, name);
    assert.equal(operation.bindings.mqtt.retain, retain, name);
  }
});

test('every canonical address is documented', () => {
  for (const [address] of Object.values(expected))
    assert.match(mqttDocs, new RegExp(address.replace(/[{}]/g, '\\$&')));
});

test('the remote factory reset command is absent', () => {
  const commandSchema = fs.readFileSync(
    path.join(repositoryRoot, 'schemas', 'mqtt', 'command-v1.schema.json'),
    'utf8',
  );
  assert.doesNotMatch(commandSchema, /FACTORY_RESET/);
});
