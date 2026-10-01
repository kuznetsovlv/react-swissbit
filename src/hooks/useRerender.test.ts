// @vitest-environment jsdom
import {act, renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {useRerender} from './useRerender';

describe('useRerender', () => {
    it('rerenders the component when called', () => {
        let renderCount = 0;

        const {result} = renderHook(() => {
            renderCount++;

            return useRerender();
        });

        expect(renderCount).toBe(1);

        act(() => {
            result.current();
        });

        expect(renderCount).toBe(2);
    });

    it('can trigger multiple rerenders', () => {
        let renderCount = 0;

        const {result} = renderHook(() => {
            renderCount++;

            return useRerender();
        });

        act(() => {
            result.current();
        });

        act(() => {
            result.current();
        });

        expect(renderCount).toBe(3);
    });

    it('keeps the returned function stable across renders', () => {
        const {result} = renderHook(() => useRerender());

        const rerender = result.current;

        act(() => {
            rerender();
        });

        expect(result.current).toBe(rerender);
    });
});
