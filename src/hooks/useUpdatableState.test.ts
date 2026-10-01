// @vitest-environment jsdom

import {act, renderHook} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {useUpdatableState} from './useUpdatableState';

describe('useUpdatableState', () => {
    it('uses the provided initial state', () => {
        const {result} = renderHook(() => useUpdatableState('initial'));

        expect(result.current[0]).toBe('initial');
    });

    it('supports a lazy initializer', () => {
        const initializer = vi.fn(() => 'initial');

        const {result} = renderHook(() => useUpdatableState(initializer));

        expect(result.current[0]).toBe('initial');
        expect(initializer).toHaveBeenCalledOnce();
    });

    it('updates local state', () => {
        const {result} = renderHook(() => useUpdatableState('initial'));

        act(() => {
            result.current[1]('updated');
        });

        expect(result.current[0]).toBe('updated');
    });

    it('supports functional state updates', () => {
        const {result} = renderHook(() => useUpdatableState(1));

        act(() => {
            result.current[1]((value) => value + 1);
        });

        expect(result.current[0]).toBe(2);
    });

    it('preserves local state while stateValue remains unchanged', () => {
        const {result, rerender} = renderHook(
            ({stateValue}) => useUpdatableState(stateValue),
            {
                initialProps: {
                    stateValue: 'initial',
                },
            }
        );

        act(() => {
            result.current[1]('local');
        });

        rerender({
            stateValue: 'initial',
        });

        expect(result.current[0]).toBe('local');
    });

    it('resets local state when stateValue changes', () => {
        const {result, rerender} = renderHook(
            ({stateValue}) => useUpdatableState(stateValue),
            {
                initialProps: {
                    stateValue: 'first',
                },
            }
        );

        act(() => {
            result.current[1]('local');
        });

        expect(result.current[0]).toBe('local');

        rerender({
            stateValue: 'second',
        });

        expect(result.current[0]).toBe('second');
    });

    it('does not cause an additional render when stateValue changes', () => {
        let renderCount = 0;

        const {result, rerender} = renderHook(
            ({stateValue}) => {
                renderCount++;

                return useUpdatableState(stateValue);
            },
            {
                initialProps: {
                    stateValue: 'first',
                },
            }
        );

        act(() => {
            result.current[1]('local');
        });

        const rendersBeforeUpdate = renderCount;

        rerender({
            stateValue: 'second',
        });

        expect(result.current[0]).toBe('second');
        expect(renderCount).toBe(rendersBeforeUpdate + 1);
    });

    it('uses the updated external state as the base for later functional updates', () => {
        const {result, rerender} = renderHook(
            ({stateValue}) => useUpdatableState(stateValue),
            {
                initialProps: {
                    stateValue: 1,
                },
            }
        );

        act(() => {
            result.current[1](10);
        });

        rerender({
            stateValue: 20,
        });

        expect(result.current[0]).toBe(20);

        act(() => {
            result.current[1]((value) => value + 1);
        });

        expect(result.current[0]).toBe(21);
    });

    it('evaluates a new initializer when stateValue changes', () => {
        const firstInitializer = vi.fn(() => 'first');
        const secondInitializer = vi.fn(() => 'second');

        const {result, rerender} = renderHook(
            ({stateValue}) => useUpdatableState(stateValue),
            {
                initialProps: {
                    stateValue: firstInitializer,
                },
            }
        );

        expect(result.current[0]).toBe('first');
        expect(firstInitializer).toHaveBeenCalledOnce();

        rerender({
            stateValue: secondInitializer,
        });

        expect(result.current[0]).toBe('second');
        expect(firstInitializer).toHaveBeenCalledOnce();
        expect(secondInitializer).toHaveBeenCalledOnce();
    });

    it('does not reevaluate an unchanged initializer on rerender', () => {
        const initializer = vi.fn(() => 'initial');

        const {result, rerender} = renderHook(() =>
            useUpdatableState(initializer)
        );

        expect(result.current[0]).toBe('initial');

        rerender();
        rerender();

        expect(initializer).toHaveBeenCalledOnce();
    });

    it('uses a custom comparator to detect stateValue changes', () => {
        const {result, rerender} = renderHook(
            ({stateValue}) =>
                useUpdatableState(
                    stateValue,
                    (a, b) =>
                        typeof a !== 'function' &&
                        typeof b !== 'function' &&
                        a.id === b.id
                ),
            {
                initialProps: {
                    stateValue: {
                        id: 1,
                        label: 'first',
                    },
                },
            }
        );

        act(() => {
            result.current[1]({
                id: 10,
                label: 'local',
            });
        });

        rerender({
            stateValue: {
                id: 1,
                label: 'changed label',
            },
        });

        expect(result.current[0]).toEqual({
            id: 10,
            label: 'local',
        });

        rerender({
            stateValue: {
                id: 2,
                label: 'second',
            },
        });

        expect(result.current[0]).toEqual({
            id: 2,
            label: 'second',
        });
    });

    it('uses Object.is semantics by default', () => {
        const {result, rerender} = renderHook(
            ({stateValue}) => useUpdatableState(stateValue),
            {
                initialProps: {
                    stateValue: NaN,
                },
            }
        );

        act(() => {
            result.current[1](42);
        });

        rerender({
            stateValue: NaN,
        });

        expect(result.current[0]).toBe(42);
    });

    it('does not rerender when the setter resolves to the current state', () => {
        let renderCount = 0;

        const {result} = renderHook(() => {
            renderCount++;

            return useUpdatableState(1);
        });

        const rendersBeforeUpdate = renderCount;

        act(() => {
            result.current[1]((value) => value);
        });

        expect(result.current[0]).toBe(1);
        expect(renderCount).toBe(rendersBeforeUpdate);
    });

    it('keeps the setter reference stable across renders', () => {
        const {result, rerender} = renderHook(
            ({stateValue}) => useUpdatableState(stateValue),
            {
                initialProps: {
                    stateValue: 1,
                },
            }
        );

        const setState = result.current[1];

        act(() => {
            setState(2);
        });

        expect(result.current[1]).toBe(setState);

        rerender({
            stateValue: 3,
        });

        expect(result.current[1]).toBe(setState);
    });
});
