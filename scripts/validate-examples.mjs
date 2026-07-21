import path from 'node:path';
import {
  createAjv,
  loadExampleManifest,
  readJson,
  repositoryRoot,
  validateContract,
} from './lib/contract-tools.mjs';

const ajv = createAjv();
const manifest = loadExampleManifest();
let validCount = 0;
let invalidCount = 0;

for (const [file, schemaId] of Object.entries(manifest.valid)) {
  const data = readJson(path.join(repositoryRoot, 'examples', 'valid', file));
  const result = validateContract(ajv, schemaId, data);
  if (!result.valid)
    throw new Error(`${file} should be valid:\n${JSON.stringify(result.errors, null, 2)}`);
  validCount += 1;
}

for (const [file, expectation] of Object.entries(manifest.invalid)) {
  const data = readJson(path.join(repositoryRoot, 'examples', 'invalid', file));
  const result = validateContract(ajv, expectation.schema, data);
  if (result.valid) throw new Error(`${file} should be invalid`);
  if (!result.errors.some((error) => error.keyword === expectation.expected)) {
    throw new Error(
      `${file} did not fail for ${expectation.expected}:\n${JSON.stringify(result.errors, null, 2)}`,
    );
  }
  invalidCount += 1;
}

console.log(
  `Validated ${validCount} valid examples and ${invalidCount} intentionally invalid examples.`,
);
