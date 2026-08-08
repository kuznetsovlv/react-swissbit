// @vitest-environment jsdom

import {act, renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {useToggle} from './useToggle';

describe('useToggle', () => {
    it.each([false, true])('uses %s as the initial value', (initialValue) => {
        const {result} = renderHook(() => useToggle(initialValue));

        expect(result.current[0]).toBe(initialValue);
    });

    it('sets the value to true with on', () => {
        const {result} = renderHook(() => useToggle(false));

        act(() => {
            result.current[1].on();
        });

        expect(result.current[0]).toBe(true);
    });

    it('sets the value to false with off', () => {
        const {result} = renderHook(() => useToggle(true));

        act(() => {
            result.current[1].off();
        });

        expect(result.current[0]).toBe(false);
    });

    it('inverts the value with toggle', () => {
        const {result} = renderHook(() => useToggle(false));

        act(() => {
            result.current[1].toggle();
        });

        expect(result.current[0]).toBe(true);

        act(() => {
            result.current[1].toggle();
        });

        expect(result.current[0]).toBe(false);
    });

    it('sets the value explicitly with set', () => {
        const {result} = renderHook(() => useToggle(false));

        act(() => {
            result.current[1].set(true);
        });

        expect(result.current[0]).toBe(true);

        act(() => {
            result.current[1].set(false);
        });

        expect(result.current[0]).toBe(false);
    });

    it('does not reset the value when initialValue changes', () => {
        const {result, rerender} = renderHook(
            ({initialValue}) => useToggle(initialValue),
            {
                initialProps: {
                    initialValue: false,
                },
            }
        );

        rerender({
            initialValue: true,
        });

        expect(result.current[0]).toBe(false);
    });

    it('keeps the methods object stable across state changes', () => {
        const {result} = renderHook(() => useToggle(false));

        const methods = result.current[1];

        act(() => {
            result.current[1].toggle();
        });

        expect(result.current[1]).toBe(methods);
    });

    it('keeps method references stable across state changes', () => {
        const {result} = renderHook(() => useToggle(false));

        const {on, off, toggle, set} = result.current[1];

        act(() => {
            result.current[1].toggle();
        });

        expect(result.current[1].on).toBe(on);
        expect(result.current[1].off).toBe(off);
        expect(result.current[1].toggle).toBe(toggle);
        expect(result.current[1].set).toBe(set);
    });
});
