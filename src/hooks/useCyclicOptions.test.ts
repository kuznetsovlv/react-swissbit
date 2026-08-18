// @vitest-environment jsdom

import {act, renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {useCyclicOptions} from './useCyclicOptions';

describe('useCyclicOptions', () => {
    it('uses the first option by default', () => {
        const {result} = renderHook(() =>
            useCyclicOptions(['first', 'second', 'third'])
        );

        expect(result.current[0]).toBe('first');
    });

    it('uses the provided initial option', () => {
        const {result} = renderHook(() =>
            useCyclicOptions(['first', 'second', 'third'], 'second')
        );

        expect(result.current[0]).toBe('second');
    });

    it('wraps from the last option to the first with next', () => {
        const {result} = renderHook(() =>
            useCyclicOptions(['first', 'second', 'third'], 'third')
        );

        act(() => {
            result.current[1].next();
        });

        expect(result.current[0]).toBe('first');
    });

    it('wraps from the first option to the last with previous', () => {
        const {result} = renderHook(() =>
            useCyclicOptions(['first', 'second', 'third'])
        );

        act(() => {
            result.current[1].previous();
        });

        expect(result.current[0]).toBe('third');
    });

    it('cycles through options repeatedly', () => {
        const {result} = renderHook(() =>
            useCyclicOptions(['first', 'second', 'third'])
        );

        act(() => {
            result.current[1].next();
        });

        expect(result.current[0]).toBe('second');

        act(() => {
            result.current[1].next();
        });

        expect(result.current[0]).toBe('third');

        act(() => {
            result.current[1].next();
        });

        expect(result.current[0]).toBe('first');
    });

    it('keeps a single option selected when cycling', () => {
        const {result} = renderHook(() => useCyclicOptions(['only']));

        act(() => {
            result.current[1].next();
            result.current[1].previous();
        });

        expect(result.current[0]).toBe('only');
    });

    it('keeps the methods object stable across state changes', () => {
        const {result} = renderHook(() =>
            useCyclicOptions(['first', 'second'])
        );

        const methods = result.current[1];

        act(() => {
            methods.next();
        });

        expect(result.current[1]).toBe(methods);
    });
});
