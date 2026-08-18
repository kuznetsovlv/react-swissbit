// @vitest-environment jsdom

import {renderHook} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {useConstant} from './useConstant';

describe('useConstant', () => {
    it('returns the value provided on the initial render', () => {
        const {result} = renderHook(() => useConstant('initial'));

        expect(result.current).toBe('initial');
    });

    it('keeps the initial value when the provided value changes', () => {
        const {result, rerender} = renderHook(({value}) => useConstant(value), {
            initialProps: {
                value: 'first',
            },
        });

        rerender({
            value: 'second',
        });

        expect(result.current).toBe('first');
    });

    it('preserves the initial object reference', () => {
        const first = {value: 1};
        const second = {value: 2};

        const {result, rerender} = renderHook(({value}) => useConstant(value), {
            initialProps: {
                value: first,
            },
        });

        rerender({
            value: second,
        });

        expect(result.current).toBe(first);
    });

    it('preserves function values without invoking them', () => {
        const first = vi.fn(() => 'first');
        const second = vi.fn(() => 'second');

        const {result, rerender} = renderHook(
            ({value}: {value: () => string}) => useConstant(value),
            {
                initialProps: {
                    value: first,
                },
            }
        );

        expect(result.current).toBe(first);
        expect(first).not.toHaveBeenCalled();

        rerender({
            value: second,
        });

        expect(result.current).toBe(first);
        expect(first).not.toHaveBeenCalled();
        expect(second).not.toHaveBeenCalled();
    });
});
