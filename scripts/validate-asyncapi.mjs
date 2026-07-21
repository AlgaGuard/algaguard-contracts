import path from 'node:path';
import { fromFile, Parser } from '@asyncapi/parser';
import { loadSchemas, repositoryRoot } from './lib/contract-tools.mjs';

const file = path.join(repositoryRoot, 'asyncapi', 'algaguard-mqtt-v1.yaml');
const schemasById = new Map(loadSchemas().map(({ schema }) => [schema.$id, schema]));
const parser = new Parser({
  __unstable: {
    resolver: {
      resolvers: [
        {
          schema: 'urn',
          read(uri) {
            const id = uri.toString().split('#')[0];
            const schema = schemasById.get(id);
            return schema ? JSON.stringify(schema) : undefined;
          },
        },
      ],
    },
  },
});
const { document, diagnostics } = await fromFile(parser, file).parse();
const errors = diagnostics.filter((diagnostic) => diagnostic.severity === 0);
if (!document || errors.length > 0)
  throw new Error(`AsyncAPI validation failed:\n${JSON.stringify(diagnostics, null, 2)}`);
if (document.channels().all().length !== 10)
  throw new Error(`Expected 10 AsyncAPI channels, found ${document.channels().all().length}`);

console.log('Validated 1 AsyncAPI document with 10 MQTT channels.');
