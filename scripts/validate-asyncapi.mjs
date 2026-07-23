import path from 'node:path';
import { fromFile, Parser } from '@asyncapi/parser';
import { loadSchemas, repositoryRoot } from './lib/contract-tools.mjs';

const schemasById = new Map(loadSchemas().map(({ schema }) => [schema.$id, schema]));
const documents = [
  { name: 'algaguard-mqtt-v1.yaml', expectedChannels: 10, protocol: 'mqtts' },
  { name: 'algaguard-websocket-v1.yaml', expectedChannels: 2, protocol: 'wss' },
  { name: 'algaguard-websocket-v1-1.yaml', expectedChannels: 2, protocol: 'wss' },
];

for (const contract of documents) {
  const file = path.join(repositoryRoot, 'asyncapi', contract.name);
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
    throw new Error(`${contract.name} validation failed:\n${JSON.stringify(diagnostics, null, 2)}`);
  if (document.channels().all().length !== contract.expectedChannels) {
    throw new Error(
      `${contract.name}: expected ${contract.expectedChannels} channels, found ${document.channels().all().length}`,
    );
  }
  const protocols = document
    .servers()
    .all()
    .map((server) => server.protocol());
  if (!protocols.includes(contract.protocol))
    throw new Error(`${contract.name}: expected ${contract.protocol} server`);
}

console.log('Validated 3 AsyncAPI documents: MQTT v1 and WebSocket v1/v1.1.');
