import test from 'node:test';
import assert from 'node:assert/strict';
import { createAjv, loadSchemas } from '../scripts/lib/contract-tools.mjs';

test('schema filenames support major and additive minor document versions', () => {
  const filenames = loadSchemas().map(({ relative }) => relative);
  assert.ok(filenames.includes('schemas/websocket/telemetry-updated-v1-1.schema.json'));
  for (const relative of filenames)
    assert.match(relative, /-v[1-9][0-9]*(?:-[1-9][0-9]*)?\.schema\.json$/);
});

const schemas = loadSchemas();
const ajv = createAjv();

test('the repository contains the 56 planned versioned schemas', () => {
  assert.equal(schemas.length, 56);
});

for (const { relative, schema } of schemas) {
  test(`${relative} compiles by URN`, () => {
    assert.ok(ajv.getSchema(schema.$id));
  });
}
