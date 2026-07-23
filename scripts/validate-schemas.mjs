import { createAjv, loadSchemas } from './lib/contract-tools.mjs';

const schemas = loadSchemas();
const ids = new Set();
for (const { relative, schema } of schemas) {
  if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema')
    throw new Error(`${relative} does not declare Draft 2020-12`);
  if (typeof schema.$id !== 'string' || !schema.$id.startsWith('urn:algaguard:schema:'))
    throw new Error(`${relative} has an invalid URN $id`);
  if (ids.has(schema.$id)) throw new Error(`Duplicate schema ID: ${schema.$id}`);
  if (!/-v[1-9][0-9]*(?:-[1-9][0-9]*)?\.schema\.json$/.test(relative))
    throw new Error(`${relative} is not versioned`);
  ids.add(schema.$id);
}

const ajv = createAjv();
for (const id of ids) {
  if (!ajv.getSchema(id)) throw new Error(`Schema did not compile: ${id}`);
}

console.log(`Validated ${schemas.length} Draft 2020-12 schemas with unique URN identifiers.`);
