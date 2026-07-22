import test from 'node:test';
import assert from 'node:assert/strict';
import { createAjv, loadSchemas } from '../scripts/lib/contract-tools.mjs';

const schemas = loadSchemas();
const ajv = createAjv();

test('the repository contains the 30 planned versioned schemas', () => {
  assert.equal(schemas.length, 30);
});

for (const { relative, schema } of schemas) {
  test(`${relative} compiles by URN`, () => {
    assert.ok(ajv.getSchema(schema.$id));
  });
}
