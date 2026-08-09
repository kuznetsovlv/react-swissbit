// @vitest-environment jsdom
import {renderHook} from '@testing-library/react';
import {useEffect} from 'react';
import {describe, expect, it, vi} from 'vitest';

import {useOnLayoutMount, useOnMount, useOnUnmount} from './lifecycle';

describe('useOnMount', () => {
    it('calls the handler after mount', () => {
        const handler = vi.fn();

        renderHook(() => useOnMount(handler));

        expect(handler).toHaveBeenCalledOnce();
    });

    it('does not call the handler again on rerender', () => {
        const handler = vi.fn();

        const {rerender} = renderHook(() => useOnMount(handler));

        rerender();

        expect(handler).toHaveBeenCalledOnce();
    });
});

describe('useOnLayoutMount', () => {
    it('calls the handler after mount', () => {
        const handler = vi.fn();

        renderHook(() => useOnLayoutMount(handler));

        expect(handler).toHaveBeenCalledOnce();
    });

    it('runs before passive effects', () => {
        const calls: string[] = [];

        renderHook(() => {
            useOnLayoutMount(() => {
                calls.push('layout');
            });

            useEffect(() => {
                calls.push('effect');
            }, []);
        });

        expect(calls).toEqual(['layout', 'effect']);
    });
});

describe('useOnUnmount', () => {
    it('does not call the handler while mounted', () => {
        const handler = vi.fn();

        renderHook(() => useOnUnmount(handler));

        expect(handler).not.toHaveBeenCalled();
    });

    it('calls the handler on unmount', () => {
        const handler = vi.fn();

        const {unmount} = renderHook(() => useOnUnmount(handler));

        unmount();

        expect(handler).toHaveBeenCalledOnce();
    });

    it('does not call the handler on rerender', () => {
        const handler = vi.fn();

        const {rerender} = renderHook(() => useOnUnmount(handler));

        rerender();

        expect(handler).not.toHaveBeenCalled();
    });

    it('calls the latest handler on unmount', () => {
        const firstHandler = vi.fn();
        const secondHandler = vi.fn();

        const {rerender, unmount} = renderHook(
            ({handler}) => useOnUnmount(handler),
            {
                initialProps: {
                    handler: firstHandler,
                },
            }
        );

        rerender({
            handler: secondHandler,
        });

        unmount();

        expect(firstHandler).not.toHaveBeenCalled();
        expect(secondHandler).toHaveBeenCalledOnce();
    });
});
