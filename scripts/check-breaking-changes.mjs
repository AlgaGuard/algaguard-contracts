import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { compareSchemas } from './lib/breaking-change-lib.mjs';
import { loadSchemas, repositoryRoot } from './lib/contract-tools.mjs';

const requestedBase = process.env.GITHUB_BASE_REF
  ? `origin/${process.env.GITHUB_BASE_REF}`
  : 'origin/develop';
const baseCheck = spawnSync('git', ['rev-parse', '--verify', requestedBase], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});
if (baseCheck.status !== 0) {
  console.log(`Breaking-change comparison skipped because ${requestedBase} is unavailable.`);
  process.exit(0);
}

const findings = [];
let compared = 0;
for (const { file, relative, schema: next } of loadSchemas()) {
  const previousResult = spawnSync('git', ['show', `${requestedBase}:${relative}`], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
  if (previousResult.status !== 0) continue;
  compared += 1;
  const previous = JSON.parse(previousResult.stdout);
  for (const finding of compareSchemas(previous, next)) findings.push(`${relative}: ${finding}`);
  if (!fs.existsSync(file)) findings.push(`${relative}: schema file removed`);
}

if (findings.length > 0) {
  throw new Error(
    `Obvious breaking changes detected. Apply the breaking-change review process:\n${findings.join('\n')}`,
  );
}

console.log(
  `No obvious breaking changes found across ${compared} schemas available on ${requestedBase}. This check cannot prove semantic compatibility.`,
);
