import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { listFiles, loadSchemas, repositoryRoot } from './lib/contract-tools.mjs';

const failures = [];
let contractReferenceCount = 0;
let markdownLinkCount = 0;
const schemaIds = new Set(loadSchemas().map(({ schema }) => schema.$id));

function visit(value, file) {
  if (Array.isArray(value)) {
    value.forEach((item) => visit(item, file));
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (typeof value.$ref === 'string') {
    contractReferenceCount += 1;
    const reference = value.$ref;
    if (reference.startsWith('urn:')) {
      const id = reference.split('#')[0];
      if (!schemaIds.has(id))
        failures.push(`${path.relative(repositoryRoot, file)} -> ${reference}`);
    } else if (!reference.startsWith('#') && !/^https?:/.test(reference)) {
      const target = path.resolve(path.dirname(file), reference.split('#')[0]);
      if (!fs.existsSync(target))
        failures.push(`${path.relative(repositoryRoot, file)} -> ${reference}`);
    }
  }
  Object.values(value).forEach((item) => visit(item, file));
}

for (const file of listFiles(
  repositoryRoot,
  (candidate) =>
    /\.(json|ya?ml)$/.test(candidate) && !candidate.includes(`${path.sep}node_modules${path.sep}`),
)) {
  const source = fs.readFileSync(file, 'utf8');
  const parsed = file.endsWith('.json') ? JSON.parse(source) : YAML.parse(source);
  visit(parsed, file);
}

const markdownPattern = /!?\[[^\]]*\]\((?<target>[^)\r\n]+)\)/g;
for (const file of listFiles(
  repositoryRoot,
  (candidate) =>
    candidate.endsWith('.md') && !candidate.includes(`${path.sep}node_modules${path.sep}`),
)) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(markdownPattern)) {
    let target = match.groups.target.trim();
    if (target.startsWith('<') && target.includes('>'))
      target = target.slice(1, target.indexOf('>'));
    else target = target.split(/\s+["']/)[0];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#')) continue;
    markdownLinkCount += 1;
    const filePart = decodeURIComponent(target.split(/[?#]/)[0]);
    const resolved = path.resolve(path.dirname(file), filePart);
    if (!fs.existsSync(resolved))
      failures.push(`${path.relative(repositoryRoot, file)} -> ${target}`);
  }
}

if (failures.length > 0) throw new Error(`Unresolved references:\n${failures.join('\n')}`);
console.log(
  `Resolved ${contractReferenceCount} contract references and ${markdownLinkCount} relative Markdown links.`,
);
