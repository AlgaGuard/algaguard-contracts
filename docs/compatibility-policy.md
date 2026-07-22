# Compatibility policy

Compatibility is evaluated for producers and consumers in C/C++, TypeScript, Dart, and later event consumers. Namespaced `extensions` are the preferred compatible metadata mechanism when a core field is not yet broadly supported.

## Compatibility matrix

| Change                            | Existing producer      | Existing consumer                       | Classification                       |
| --------------------------------- | ---------------------- | --------------------------------------- | ------------------------------------ |
| Add optional namespaced extension | unchanged              | ignores unknown extension key           | compatible                           |
| Add optional core field           | unchanged              | must tolerate documented optional field | review required, normally compatible |
| Add required field                | cannot produce it      | may reject old message                  | breaking                             |
| Remove field                      | may still send it      | loses expected data                     | breaking                             |
| Change JSON type                  | sends old type         | cannot decode safely                    | breaking                             |
| Change canonical unit or meaning  | sends old meaning      | silently misinterprets data             | breaking                             |
| Narrow enum or numeric range      | may send removed value | rejects valid historical value          | potentially breaking                 |
| Widen accepted enum               | unchanged              | generated exhaustive clients may fail   | consumer review required             |
| Increase replay batch maximum     | may send larger packet | constrained devices/services may reject | capacity review required             |
| Change MQTT topic major           | publishes old path     | subscribes old path                     | breaking with coexistence required   |
| Add optional WebSocket extension  | unchanged              | ignores namespaced extension            | compatible                           |
| Add WebSocket event type          | unchanged              | generated exhaustive clients may fail   | consumer review required             |
| Rename WebSocket event type       | publishes old name     | cannot route renamed event              | breaking with coexistence required   |
| Change subscription resource rule | may request old scope  | authorization meaning changes           | breaking/security review required    |
| Tighten connection limit          | may exceed new limit   | receives capacity error or disconnect   | operational and capacity review      |

The automated breaking-change checker detects obvious structural changes only. It cannot prove semantic compatibility, generated-client behavior, packet-size safety, authorization correctness, reconnection safety, or scientific validity. Human review remains mandatory. WebSocket is non-durable; adding replay or a durable cursor requires a new contract and architecture review.
