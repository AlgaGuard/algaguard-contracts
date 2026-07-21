import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';
import { listFiles, repositoryRoot } from './lib/contract-tools.mjs';

const openApiRoot = path.join(repositoryRoot, 'openapi');
const files = listFiles(openApiRoot, (file) => file.endsWith('.yaml'));
if (files.length !== 7) throw new Error(`Expected 7 OpenAPI files, found ${files.length}`);

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const document = YAML.parse(source);
  if (document.openapi !== '3.1.0')
    throw new Error(`${path.basename(file)} must use OpenAPI 3.1.0`);
  if (!document.info?.title || !document.info?.version)
    throw new Error(`${path.basename(file)} is missing info metadata`);
  if (/amazonaws\.com|execute-api/i.test(source))
    throw new Error(`${path.basename(file)} contains an AWS-specific server reference`);
}

const spectralExecutable = process.platform === 'win32' ? 'spectral.cmd' : 'spectral';
const spectral = spawnSync(
  spectralExecutable,
  ['lint', 'openapi/*.yaml', '--ruleset', '.spectral.yaml'],
  {
    cwd: repositoryRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  },
);
if (spectral.status !== 0)
  throw new Error(`Spectral validation failed:\n${spectral.stdout}${spectral.stderr}`);

console.log(`Validated ${files.length} OpenAPI 3.1 documents with Spectral.`);
