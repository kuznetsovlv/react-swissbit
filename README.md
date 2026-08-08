# react-swissbit

[![CI](https://github.com/kuznetsovlv/react-swissbit/actions/workflows/ci.yml/badge.svg)](https://github.com/kuznetsovlv/react-swissbit/actions/workflows/ci.yml)

Small practical utilities for React and TypeScript applications.

> **Status:** early development. The API may evolve before `1.0.0`.

[Coverage report](https://kuznetsovlv.github.io/react-swissbit/)

## What is react-swissbit?

`react-swissbit` is a collection of small, focused utilities for recurring React
and TypeScript tasks.

The goal is not to replace React primitives or introduce another application
framework. Instead, the package provides narrow abstractions for common pieces
of boilerplate while keeping their behavior explicit and predictable.

The project is intended to stay small and modular:

- focused, single-purpose utilities;
- strict TypeScript types;
- React provided as a peer dependency rather than bundled with the package;
- ESM and CommonJS builds;
- tree-shakeable exports;
- automated tests, linting, type checking, coverage, and package validation.

## Planned direction

The first utilities are expected to focus primarily on React hooks and small
frontend helpers.

Possible early additions include a boolean state toggle hook, a stable event
callback helper, and other small wrappers around common React patterns.

Names and APIs may still change before `0.1.0`.

## Installation

There is currently no usable release to install.

The package name is reserved on npm as `react-swissbit@0.0.0`. Installation
instructions will be added when the first public API is released.

## Development

Install dependencies:

```bash
    pnpm install
```

Run the complete local quality check:

```bash
    pnpm check
```

The check includes formatting, ESLint, TypeScript, tests, coverage, library
build, and a dry-run package archive.

### Useful commands

| Command             | Purpose                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm build`        | Build ESM, CommonJS, and type declarations                                                   |
| `pnpm test`         | Run the test suite once                                                                      |
| `pnpm test:watch`   | Run tests in watch mode                                                                      |
| `pnpm coverage`     | Run tests with coverage<br/>Open the local HTML coverage report:xdg-open coverage/index.html |
| `pnpm lint`         | Run ESLint                                                                                   |
| `pnpm typecheck`    | Run TypeScript without emitting files                                                        |
| `pnpm format`       | Format files with Prettier                                                                   |
| `pnpm format:check` | Check formatting                                                                             |
| `pnpm pack:check`   | Inspect the package tarball without publishing                                               |
| `pnpm check`        | Run the full local quality pipeline                                                          |
| `pnpm changeset`    | Describe a user-facing change for a future release                                           |

## Releases

Releases are managed with
[Changesets](https://github.com/changesets/changesets).

User-facing changes should include a changeset. After those changes reach
`main`, the release workflow maintains a release pull request containing the
version and changelog updates.

Merging that release pull request publishes the package to npm through GitHub
Actions and npm Trusted Publishing.

See [CHANGELOG.md](./CHANGELOG.md) for released changes.

## License

[MIT](./LICENSE)
