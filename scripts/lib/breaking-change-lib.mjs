function normalizedTypes(schema) {
  if (!schema || schema.type === undefined) return null;
  return new Set(Array.isArray(schema.type) ? schema.type : [schema.type]);
}

function sameSet(left, right) {
  if (left === null || right === null) return left === right;
  return left.size === right.size && [...left].every((value) => right.has(value));
}

export function compareSchemas(previous, next, pointer = '#') {
  const findings = [];
  const previousTypes = normalizedTypes(previous);
  const nextTypes = normalizedTypes(next);
  if (!sameSet(previousTypes, nextTypes)) findings.push(`${pointer}: changed type`);

  if (Array.isArray(previous?.enum) && Array.isArray(next?.enum)) {
    const nextValues = new Set(next.enum.map((value) => JSON.stringify(value)));
    const removed = previous.enum.filter((value) => !nextValues.has(JSON.stringify(value)));
    if (removed.length > 0)
      findings.push(`${pointer}: narrowed enum by removing ${removed.map(String).join(', ')}`);
  }

  const previousRequired = new Set(previous?.required ?? []);
  const nextRequired = new Set(next?.required ?? []);
  for (const required of nextRequired) {
    if (!previousRequired.has(required))
      findings.push(`${pointer}: newly required property ${required}`);
  }

  const previousProperties = previous?.properties ?? {};
  const nextProperties = next?.properties ?? {};
  for (const name of Object.keys(previousProperties)) {
    if (!(name in nextProperties)) findings.push(`${pointer}: removed property ${name}`);
    else
      findings.push(
        ...compareSchemas(
          previousProperties[name],
          nextProperties[name],
          `${pointer}/properties/${name}`,
        ),
      );
  }

  if (
    previous?.properties?.unit?.const !== undefined &&
    next?.properties?.unit?.const !== previous.properties.unit.const
  ) {
    findings.push(`${pointer}: changed canonical unit`);
  }

  const previousDefs = previous?.$defs ?? {};
  const nextDefs = next?.$defs ?? {};
  for (const name of Object.keys(previousDefs)) {
    if (!(name in nextDefs)) findings.push(`${pointer}: removed definition ${name}`);
    else
      findings.push(
        ...compareSchemas(previousDefs[name], nextDefs[name], `${pointer}/$defs/${name}`),
      );
  }

  const previousAllOf = previous?.allOf ?? [];
  const nextAllOf = next?.allOf ?? [];
  for (let index = 0; index < Math.min(previousAllOf.length, nextAllOf.length); index += 1) {
    findings.push(
      ...compareSchemas(previousAllOf[index], nextAllOf[index], `${pointer}/allOf/${index}`),
    );
  }
  if (nextAllOf.length < previousAllOf.length)
    findings.push(`${pointer}: removed allOf constraints`);

  return [...new Set(findings)];
}
