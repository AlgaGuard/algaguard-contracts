# Code generation policy

Schemas and OpenAPI documents are authoritative inputs. Generated C/C++, TypeScript, or Dart models may be produced in consumer repositories only after their generator version and output review are approved.

Generation must preserve:

- decimal strings for sequences and monotonic counters;
- UUID and UTC timestamp validation at boundaries;
- unknown namespaced extensions without treating them as business fields;
- explicit optionality and enums;
- canonical parameter and unit names.

Generated output is not published from this private npm package in Phase 2. Consumers pin the contracts commit or release and run representative round-trip tests. Generator convenience never justifies changing wire meaning or adding backend business logic to this repository.
