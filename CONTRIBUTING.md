# Contributing

## Before changing a contract

1. Read the contract catalog and the versioning, compatibility, and deprecation policies.
2. Search open and closed issues for equivalent work.
3. Use the contract-change issue template. Use the breaking-change template and label when compatibility may be affected.
4. Confirm whether the file is already released. Released files are immutable.

## Required change set

- Add a new versioned schema or specification when an existing published contract would change.
- Update valid and invalid examples.
- Add focused tests, including the intended failure reason for invalid examples.
- Update semantic documentation, the compatibility matrix, and `CHANGELOG.md`.
- Record an ADR for breaking changes.

## Validation

```sh
npm ci
npm run check
```

Pull requests must explain architecture alignment, compatibility impact, test results, and consumer migration needs. Never commit credentials, generated secrets, scientific claims, runtime business logic, or deployment implementation.
