import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  createAjv,
  loadExampleManifest,
  readJson,
  repositoryRoot,
  validateContract,
} from '../scripts/lib/contract-tools.mjs';

const ajv = createAjv();
const manifest = loadExampleManifest();

for (const [file, expectation] of Object.entries(manifest.invalid)) {
  test(`${file} fails for ${expectation.expected}`, () => {
    const data = readJson(path.join(repositoryRoot, 'examples', 'invalid', file));
    const result = validateContract(ajv, expectation.schema, data);
    assert.equal(result.valid, false);
    assert.ok(
      result.errors.some((error) => error.keyword === expectation.expected),
      JSON.stringify(result.errors, null, 2),
    );
  });
}
