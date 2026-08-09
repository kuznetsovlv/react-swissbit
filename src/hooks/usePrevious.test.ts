// @vitest-environment jsdom

import {renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {usePrevious} from './usePrevious';

describe('usePrevious', () => {
    it('returns undefined on the initial render by default', () => {
        const {result} = renderHook(() => usePrevious('first'));

        expect(result.current).toBeUndefined();
    });

    it('returns the provided initial previous value on the initial render', () => {
        const {result} = renderHook(() => usePrevious('current', 'initial'));

        expect(result.current).toBe('initial');
    });

    it('returns the previous value after a rerender', () => {
        const {result, rerender} = renderHook(({value}) => usePrevious(value), {
            initialProps: {
                value: 'first',
            },
        });

        rerender({
            value: 'second',
        });

        expect(result.current).toBe('first');
    });

    it('replaces the initial previous value after the first committed render', () => {
        const {result, rerender} = renderHook(
            ({value}) => usePrevious(value, 0),
            {
                initialProps: {
                    value: 1,
                },
            }
        );

        expect(result.current).toBe(0);

        rerender({
            value: 2,
        });

        expect(result.current).toBe(1);

        rerender({
            value: 3,
        });

        expect(result.current).toBe(2);
    });

    it('preserves object references', () => {
        const first = {value: 1};
        const second = {value: 2};

        const {result, rerender} = renderHook(({value}) => usePrevious(value), {
            initialProps: {
                value: first,
            },
        });

        rerender({
            value: second,
        });

        expect(result.current).toBe(first);
    });
});
