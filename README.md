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

#### `useOptions`

Manages a value selected from a fixed list of options.

The hook provides methods for moving forward and backward through the list,
jumping to its boundaries, or selecting an option explicitly.

Navigation stops at the boundaries. Calling `next()` while the last option is
selected or `previous()` while the first option is selected leaves the current
option unchanged.

```tsx
import {useOptions} from 'react-swissbit';

const sizes = ['small', 'medium', 'large'] as const;

function SizeSelector() {
    const [size, {next, previous, begin, end, set}] = useOptions(
        sizes,
        'medium'
    );

    return (
        <div>
            <p>Selected size: {size}</p>

            <button onClick={previous}>Previous</button>
            <button onClick={next}>Next</button>
            <button onClick={begin}>First</button>
            <button onClick={end}>Last</button>
            <button onClick={() => set('medium')}>Medium</button>
        </div>
    );
}
```

Signature:

```ts
useOptions<T>(
    options: readonly T[],
    initialOption?: T
): [T, OptionsMethods<T>];
```

`options` must contain at least one element and must not contain duplicate
values.

`initialOption` must be one of the provided options. When omitted, the first
option is selected.

The options and initial option are captured on the initial render. Changes to
either argument on later renders are ignored.

The returned methods object and all of its methods have stable references
across renders.

> **Note:** `NaN` is currently not supported as an option. Its JavaScript
> equality behavior is incompatible with the option lookup used internally by
> this hook.

#### `useCyclicOptions`

Manages a value selected from a fixed list of options with cyclic navigation.

It provides the same API as `useOptions`, but navigation wraps around the list.
Calling `next()` while the last option is selected moves to the first option,
and calling `previous()` while the first option is selected moves to the last
option.

```tsx
import {useCyclicOptions} from 'react-swissbit';

const themes = ['light', 'dark', 'system'] as const;

function ThemeSelector() {
    const [theme, {next, previous}] = useCyclicOptions(themes);

    return (
        <div>
            <p>Theme: {theme}</p>

            <button onClick={previous}>Previous theme</button>
            <button onClick={next}>Next theme</button>
        </div>
    );
}
```

Signature:

```ts
useCyclicOptions<T>(
    options: readonly T[],
    initialOption?: T
): [T, OptionsMethods<T>];
```

The same validation, initial-value, snapshot, and stable-reference guarantees
as `useOptions` apply.

A list containing a single option is valid. In that case, navigation keeps the
same option selected.

#### Options methods

Both `useOptions` and `useCyclicOptions` return an `OptionsMethods<T>` object:

```ts
interface OptionsMethods<T> {
    next: () => void;
    previous: () => void;
    begin: () => void;
    end: () => void;
    set: (value: T) => void;
}
```

| Method       | Description                 |
| ------------ | --------------------------- |
| `next()`     | Selects the next option     |
| `previous()` | Selects the previous option |
| `begin()`    | Selects the first option    |
| `end()`      | Selects the last option     |
| `set(value)` | Selects a specific option   |

`set(value)` throws if the supplied value is not one of the configured options.

For object options, values are matched by reference:

```tsx
const compact = {columns: 1};
const detailed = {columns: 3};

const [layout, {set}] = useOptions([compact, detailed]);

set(detailed);
```

> **Note:** `NaN` is currently not supported as an option. Its JavaScript
> equality behavior is incompatible with the option lookup used internally by
> this hook.

#### `useConstant`

Returns the value provided on the initial render and keeps it unchanged for the lifetime of the component.

```tsx
import {useConstant} from 'react-swissbit';

function Example({options}: {options: Options}) {
    const initialOptions = useConstant(options);

    return <Widget options={initialOptions} />;
}
```

Signature:

```ts
useConstant<T>(value: T): T;
```

The value passed on the initial render is preserved as-is. Values passed on later renders are ignored, including when their identity changes.

Object and function references are preserved without copying or invoking them.

`useConstant` preserves an already evaluated value. It does not provide lazy initialization: expressions passed as arguments are still evaluated before the hook is called on every render.

For example:

```tsx
const value = useConstant(createExpensiveObject());
```

`createExpensiveObject()` is still called on every render. Only the value returned during the initial render is preserved by `useConstant`.

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

#### `useHandler`

Returns a stable function that always invokes the latest provided handler.

Unlike `useCallback`, changing the handler does not change the reference of the
function returned by `useHandler`. This can be useful when a callback needs
access to the latest props or state but should keep a stable identity across
renders.

```tsx
import {useHandler} from 'react-swissbit';

function Counter({count}: {count: number}) {
    const handleClick = useHandler(() => {
        console.log(`Current count: ${count}`);
    });

    return <button onClick={handleClick}>Log count</button>;
}
```

Signature:

```ts
useHandler<F extends (...args: never[]) => unknown>(fn: F): F;
```

The returned function:

- keeps the same reference across renders;
- accepts the same arguments as the provided handler;
- returns the handler's return value;
- invokes the latest handler after each committed render.

This makes `useHandler` useful for callbacks whose identity should remain stable
without capturing stale values from an earlier render.

#### `useOnMount`

Runs a callback after the component is mounted.

```tsx
import {useOnMount} from 'react-swissbit';

function Example() {
    useOnMount(() => {
        console.log('Mounted');
    });

    return <div>Example</div>;
}
```

Signature:

```ts
useOnMount(fn: () => void): void;
```

The callback runs after the initial committed render and is not called again on
ordinary rerenders.

> **React Strict Mode:** in development, React may run Effects an additional
> time to verify that their setup and cleanup logic is safe. As a result, the
> callback passed to `useOnMount` may be invoked more than once during
> development. Code using this hook should not rely on the callback being
> executed exactly once for the entire lifetime of the application.

#### `useOnLayoutMount`

Runs a callback synchronously after the component is mounted and before the
browser repaints the screen.

```tsx
import {useOnLayoutMount} from 'react-swissbit';

function Example() {
    useOnLayoutMount(() => {
        measureLayout();
    });

    return <div>Example</div>;
}
```

Signature:

```ts
useOnLayoutMount(fn: () => void): void;
```

This hook uses `useLayoutEffect`. Prefer `useOnMount` unless the callback needs
to run before paint, such as when measuring or synchronously adjusting layout.

The callback is not called again on ordinary rerenders.

> **React Strict Mode:** in development, React may run Layout Effects an
> additional time to verify their setup and cleanup logic. Therefore, the
> callback passed to `useOnLayoutMount` may be invoked more than once during
> development.

#### `useOnUnmount`

Runs the latest provided callback when the component is unmounted.

```tsx
import {useOnUnmount} from 'react-swissbit';

function Example() {
    useOnUnmount(() => {
        connection.close();
    });

    return <div>Example</div>;
}
```

Signature:

```ts
useOnUnmount(fn: () => void): void;
```

The callback is not invoked on ordinary rerenders. If a new callback is
provided during the component's lifetime, the latest callback from the most
recently committed render is used when cleanup runs.

> **React Strict Mode:** in development, React may run an additional Effect
> setup and cleanup cycle without permanently unmounting the component.
> Consequently, the callback passed to `useOnUnmount` may run during this
> development-only cleanup as well as when the component is actually
> unmounted. Do not use this hook as a guarantee that the callback means the
> component has been permanently removed from the application.

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

| Command               | Purpose                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm build`          | Build ESM, CommonJS, and type declarations                                                   |
| `pnpm test`           | Run the test suite once                                                                      |
| `pnpm test:watch`     | Run tests in watch mode                                                                      |
| `pnpm coverage`       | Run tests with coverage<br/>Open the local HTML coverage report:xdg-open coverage/index.html |
| `pnpm prettier`       | Format files with Prettier                                                                   |
| `pnpm prettier:check` | Check Prettier formatting                                                                    |
| `pnpm lint`           | Run ESLint and automatically fix issues                                                      |
| `pnpm lint:check`     | Run ESLint without modifying files                                                           |
| `pnpm format`         | Run all formatting and lint autofixes                                                        |
| `pnpm format:check`   | Check formatting and linting without changes                                                 |
| `pnpm typecheck`      | Run TypeScript without emitting files                                                        |
| `pnpm pack:check`     | Inspect the package tarball without publishing                                               |
| `pnpm check`          | Run the full local quality pipeline                                                          |
| `pnpm changeset`      | Describe a user-facing change for a future release                                           |

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
