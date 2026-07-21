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

for (const [file, schemaId] of Object.entries(manifest.valid)) {
  test(`${file} passes schema and semantic validation`, () => {
    const data = readJson(path.join(repositoryRoot, 'examples', 'valid', file));
    const result = validateContract(ajv, schemaId, data);
    assert.equal(result.valid, true, JSON.stringify(result.errors, null, 2));
  });
}
