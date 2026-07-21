import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const unsigned64Maximum = 18446744073709551615n;

export function listFiles(directory, predicate = () => true) {
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...listFiles(fullPath, predicate));
    else if (entry.isFile() && predicate(fullPath)) results.push(fullPath);
  }
  return results.sort();
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function loadSchemas() {
  const schemaRoot = path.join(repositoryRoot, 'schemas');
  return listFiles(schemaRoot, (file) => file.endsWith('.schema.json')).map((file) => ({
    file,
    relative: path.relative(repositoryRoot, file).replaceAll('\\', '/'),
    schema: readJson(file),
  }));
}

export function createAjv() {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    strictRequired: false,
    validateFormats: true,
  });
  addFormats(ajv);
  for (const { schema } of loadSchemas()) ajv.addSchema(schema);
  return ajv;
}

function semanticError(keyword, instancePath, message) {
  return { keyword, instancePath, message };
}

function validDecimalString(value) {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]{0,19})$/.test(value)) return false;
  try {
    return BigInt(value) <= unsigned64Maximum;
  } catch {
    return false;
  }
}

function telemetryBatchErrors(data) {
  const payload = data.payload;
  if (!payload || !Array.isArray(payload.samples)) return [];
  const errors = [];
  const sequences = payload.samples.map((sample) => sample.sequence);
  if (payload.sampleCount !== payload.samples.length) {
    errors.push(
      semanticError('SAMPLE_COUNT_MISMATCH', '/payload/sampleCount', 'must equal samples.length'),
    );
  }
  if (sequences.length > 0 && payload.firstSequence !== sequences[0]) {
    errors.push(
      semanticError(
        'FIRST_SEQUENCE_MISMATCH',
        '/payload/firstSequence',
        'must equal the first sample sequence',
      ),
    );
  }
  if (sequences.length > 0 && payload.lastSequence !== sequences.at(-1)) {
    errors.push(
      semanticError(
        'LAST_SEQUENCE_MISMATCH',
        '/payload/lastSequence',
        'must equal the last sample sequence',
      ),
    );
  }
  for (let index = 0; index < sequences.length; index += 1) {
    if (!validDecimalString(sequences[index])) {
      errors.push(
        semanticError(
          'SEQUENCE_OUT_OF_RANGE',
          `/payload/samples/${index}/sequence`,
          'must fit unsigned 64-bit decimal form',
        ),
      );
      continue;
    }
    if (
      index > 0 &&
      validDecimalString(sequences[index - 1]) &&
      BigInt(sequences[index]) <= BigInt(sequences[index - 1])
    ) {
      errors.push(
        semanticError(
          'SEQUENCE_NOT_STRICTLY_INCREASING',
          `/payload/samples/${index}/sequence`,
          'must be greater than the preceding sequence',
        ),
      );
    }
  }
  const observed = payload.samples
    .map((sample, index) => ({ value: sample.observedAt, index }))
    .filter(({ value }) => typeof value === 'string');
  for (let index = 1; index < observed.length; index += 1) {
    if (Date.parse(observed[index].value) <= Date.parse(observed[index - 1].value)) {
      errors.push(
        semanticError(
          'TIMESTAMP_NOT_INCREASING',
          `/payload/samples/${observed[index].index}/observedAt`,
          'must be later than the preceding absolute observation time',
        ),
      );
    }
  }
  return errors;
}

function profileConfigurationErrors(data) {
  const parameters = data.payload?.parameters;
  if (!parameters || typeof parameters !== 'object') return [];
  const errors = [];
  const order = ['criticalLow', 'warningLow', 'warningHigh', 'criticalHigh'];
  for (const [name, parameter] of Object.entries(parameters)) {
    const supplied = order.filter((key) => typeof parameter?.[key] === 'number');
    for (let index = 1; index < supplied.length; index += 1) {
      const previous = supplied[index - 1];
      const current = supplied[index];
      if (parameter[previous] > parameter[current]) {
        errors.push(
          semanticError(
            'THRESHOLD_ORDER',
            `/payload/parameters/${name}/${current}`,
            `must be greater than or equal to ${previous}`,
          ),
        );
      }
    }
  }
  if (
    data.payload?.expiresAt &&
    Date.parse(data.payload.expiresAt) <= Date.parse(data.payload.generatedAt)
  ) {
    errors.push(
      semanticError(
        'CONFIGURATION_EXPIRES_BEFORE_GENERATED',
        '/payload/expiresAt',
        'must be later than generatedAt',
      ),
    );
  }
  return errors;
}

function temporalErrors(data, earlier, later, keyword) {
  const earlierValue = data.payload?.[earlier];
  const laterValue = data.payload?.[later];
  if (
    typeof earlierValue === 'string' &&
    typeof laterValue === 'string' &&
    Date.parse(laterValue) <= Date.parse(earlierValue)
  ) {
    return [semanticError(keyword, `/payload/${later}`, `must be later than ${earlier}`)];
  }
  return [];
}

export function semanticErrors(schemaId, data) {
  if (schemaId === 'urn:algaguard:schema:mqtt:telemetry-batch:v1')
    return telemetryBatchErrors(data);
  if (schemaId === 'urn:algaguard:schema:mqtt:profile-configuration:v1')
    return profileConfigurationErrors(data);
  if (schemaId === 'urn:algaguard:schema:mqtt:command:v1') {
    return temporalErrors(data, 'createdAt', 'expiresAt', 'COMMAND_EXPIRES_BEFORE_CREATED');
  }
  if (schemaId === 'urn:algaguard:schema:mqtt:ota-notification:v1') {
    return temporalErrors(data, 'publishedAt', 'expiresAt', 'OTA_EXPIRES_BEFORE_PUBLISHED');
  }
  if (
    schemaId === 'urn:algaguard:schema:mqtt:profile-configuration-ack:v1' &&
    data.deviceId !== data.payload?.deviceId
  ) {
    return [
      semanticError('DEVICE_ID_MISMATCH', '/payload/deviceId', 'must equal envelope deviceId'),
    ];
  }
  return [];
}

export function validateContract(ajv, schemaId, data) {
  const validator = ajv.getSchema(schemaId);
  if (!validator) throw new Error(`Unknown schema ID: ${schemaId}`);
  const validSchema = validator(data);
  const schemaErrors = validSchema ? [] : structuredClone(validator.errors ?? []);
  const semantic = validSchema ? semanticErrors(schemaId, data) : [];
  return { valid: validSchema && semantic.length === 0, errors: [...schemaErrors, ...semantic] };
}

export function loadExampleManifest() {
  return readJson(path.join(repositoryRoot, 'examples', 'manifest.json'));
}
