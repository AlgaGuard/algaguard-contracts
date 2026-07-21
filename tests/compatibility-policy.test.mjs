import test from 'node:test';
import assert from 'node:assert/strict';
import { compareSchemas } from '../scripts/lib/breaking-change-lib.mjs';

const base = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['ONLINE', 'OFFLINE'] },
    count: { type: 'integer' },
  },
  required: ['status'],
};

test('adding an optional property is not flagged as obviously breaking', () => {
  const next = structuredClone(base);
  next.properties.reason = { type: 'string' };
  assert.deepEqual(compareSchemas(base, next), []);
});

test('removing a property is flagged', () => {
  const next = structuredClone(base);
  delete next.properties.count;
  assert.ok(
    compareSchemas(base, next).some((finding) => finding.includes('removed property count')),
  );
});

test('adding a required property is flagged', () => {
  const next = structuredClone(base);
  next.properties.reason = { type: 'string' };
  next.required.push('reason');
  assert.ok(
    compareSchemas(base, next).some((finding) =>
      finding.includes('newly required property reason'),
    ),
  );
});

test('changing a type is flagged', () => {
  const next = structuredClone(base);
  next.properties.count.type = 'string';
  assert.ok(compareSchemas(base, next).some((finding) => finding.includes('changed type')));
});

test('narrowing an enum is flagged', () => {
  const next = structuredClone(base);
  next.properties.status.enum = ['ONLINE'];
  assert.ok(compareSchemas(base, next).some((finding) => finding.includes('narrowed enum')));
});
