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

## Installation

Install `react-swissbit` with your preferred package manager.

### npm

```bash
    npm install react-swissbit
```

### yarn

```bash
    yarn add react-swissbit
```

### pnpm

```bash
    pnpm add react-swissbit
```

React 18 or newer is required as a peer dependency.

## Usage

Utilities are exported directly from `react-swissbit`:

```ts
import {useToggle} from 'react-swissbit';
```

### Hooks

#### `useToggle`

Manages a boolean state and provides a set of convenience methods for changing
it.

```tsx
import {useToggle} from 'react-swissbit';

function Example() {
    const [isOpen, {on, off, toggle, set}] = useToggle(false);

    return (
        <div>
            <p>{isOpen ? 'Open' : 'Closed'}</p>

            <button onClick={on}>Open</button>
            <button onClick={off}>Close</button>
            <button onClick={toggle}>Toggle</button>
            <button onClick={() => set(true)}>Set open</button>
        </div>
    );
}
```

Signature:

```ts
useToggle(initialValue: boolean): [
    boolean,
    {
        on: () => void;
        off: () => void;
        toggle: () => void;
        set: (value: boolean) => void;
    },
];
```

The returned tuple contains:

| Value        | Description               |
| ------------ | ------------------------- |
| `value`      | Current boolean state     |
| `on()`       | Sets the value to `true`  |
| `off()`      | Sets the value to `false` |
| `toggle()`   | Inverts the current value |
| `set(value)` | Sets the value explicitly |

The methods object and all of its methods have stable references across renders,
so they can safely be passed to memoized components or used as hook
dependencies.

`initialValue` is only used to initialize the state. Changing it on a later
render does not reset the current value.

#### `usePrevious`

Returns the value from the previous committed render.

By default, the hook returns `undefined` on the initial render. An optional
initial previous value can be provided when a defined value is needed from the
first render.

```tsx
import {usePrevious} from 'react-swissbit';

function Counter({count}: {count: number}) {
    const previousCount = usePrevious(count, 0);

    return (
        <p>
            Current: {count}, previous: {previousCount}
        </p>
    );
}
```

Signatures:

```ts
usePrevious<T>(value: T): T | undefined;
usePrevious<T>(value: T, initialPreviousValue: T): T;
```

Without `initialPreviousValue`, the hook returns `undefined` on the initial
render.

When `initialPreviousValue` is provided, it is returned on the initial render.
After the first committed render, the hook returns actual previous values.

The hook preserves values as-is, including object references.

## Planned direction

The library currently focuses on small React hooks and frontend utilities.

Future additions may include stable event callbacks and other focused wrappers
around common React patterns.

The API may evolve while the package remains below `1.0.0`.

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
