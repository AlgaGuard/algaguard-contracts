# Repository working rules

These rules apply to the complete `algaguard-contracts` repository.

1. Inspect the repository, released versions, tests, and applicable policies before changing a contract.
2. Never edit a released schema or protocol version in place; add a new versioned schema and migration guidance.
3. Validate every changed schema, reference, valid example, and deliberately invalid example.
4. Preserve practical C/C++, TypeScript, and Dart compatibility. Use decimal strings for sequences and avoid unnecessary nesting.
5. Keep contracts provider-neutral and free of backend business logic, firmware implementation, UI implementation, and deployment configuration.
6. Do not publish the npm package or any generated package without explicit approval.
7. Do not add secrets, credentials, Wi-Fi values, private keys, signing keys, or provider tokens.
8. Do not invent or imply scientific approval for algae thresholds; demonstration values must be marked simulation-only.
9. Breaking changes require a new version, ADR, compatibility review, changelog entry, migration guidance, and the `breaking-change` label.
10. Run `npm run check` before committing. Do not bypass failing validation.
11. Phase 3 firmware work is out of scope. Do not create `algaguard-firmware` or implementation code here.
12. Do not merge into `main`, rewrite history, force-push, or bypass required reviews and branch rules.
