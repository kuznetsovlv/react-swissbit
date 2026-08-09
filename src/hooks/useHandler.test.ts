// @vitest-environment jsdom
import {act, renderHook} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {useHandler} from './useHandler';

describe('useHandler', () => {
    it('calls the provided handler', () => {
        const handler = vi.fn();

        const {result} = renderHook(() => useHandler(handler));

        act(() => {
            result.current();
        });

        expect(handler).toHaveBeenCalledOnce();
    });

    it('passes arguments to the provided handler', () => {
        const handler = vi.fn();

        const {result} = renderHook(() => useHandler(handler));

        act(() => {
            result.current('value', 42);
        });

        expect(handler).toHaveBeenCalledWith('value', 42);
    });

    it('returns the value returned by the provided handler', () => {
        const handler = (value: number) => value * 2;

        const {result} = renderHook(() => useHandler(handler));

        expect(result.current(21)).toBe(42);
    });

    it('keeps the same function reference across renders', () => {
        const {result, rerender} = renderHook(
            ({handler}) => useHandler(handler),
            {
                initialProps: {
                    handler: () => 'first',
                },
            }
        );

        const firstReference = result.current;

        rerender({
            handler: () => 'second',
        });

        expect(result.current).toBe(firstReference);
    });

    it('calls the latest handler after a rerender', () => {
        const firstHandler = vi.fn();
        const secondHandler = vi.fn();

        const {result, rerender} = renderHook(
            ({handler}) => useHandler(handler),
            {
                initialProps: {
                    handler: firstHandler,
                },
            }
        );

        const stableHandler = result.current;

        rerender({
            handler: secondHandler,
        });

        act(() => {
            stableHandler();
        });

        expect(firstHandler).not.toHaveBeenCalled();
        expect(secondHandler).toHaveBeenCalledOnce();
    });
});
