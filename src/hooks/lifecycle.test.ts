// @vitest-environment jsdom
import {renderHook} from '@testing-library/react';
import {useEffect} from 'react';
import {describe, expect, it, vi} from 'vitest';

import {
    useOnLayoutMount,
    useOnLayoutMountAndUnmount,
    useOnMount,
    useOnMountAndUnmount,
    useOnUnmount,
} from './lifecycle';

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

describe('useOnMountAndUnmount', () => {
    it('runs onMount after mount and passes its result to onUnmount', () => {
        const resource = {id: 1};
        const onMount = vi.fn(() => resource);
        const onUnmount = vi.fn();

        const {unmount} = renderHook(() =>
            useOnMountAndUnmount(onMount, onUnmount)
        );

        expect(onMount).toHaveBeenCalledOnce();
        expect(onUnmount).not.toHaveBeenCalled();

        unmount();

        expect(onUnmount).toHaveBeenCalledOnce();
        expect(onUnmount).toHaveBeenCalledWith(resource);
    });

    it('does not run onMount again on rerender', () => {
        const onMount = vi.fn(() => 'resource');
        const onUnmount = vi.fn();

        const {rerender} = renderHook(() =>
            useOnMountAndUnmount(onMount, onUnmount)
        );

        rerender();
        rerender();

        expect(onMount).toHaveBeenCalledOnce();
    });

    it('ignores changes to onMount after the initial render', () => {
        const firstResource = {id: 1};
        const secondResource = {id: 2};

        const firstOnMount = vi.fn(() => firstResource);
        const secondOnMount = vi.fn(() => secondResource);
        const onUnmount = vi.fn();

        const {rerender, unmount} = renderHook(
            ({onMount}) => useOnMountAndUnmount(onMount, onUnmount),
            {
                initialProps: {
                    onMount: firstOnMount,
                },
            }
        );

        rerender({
            onMount: secondOnMount,
        });

        unmount();

        expect(firstOnMount).toHaveBeenCalledOnce();
        expect(secondOnMount).not.toHaveBeenCalled();
        expect(onUnmount).toHaveBeenCalledWith(firstResource);
    });

    it('uses the latest onUnmount callback', () => {
        const resource = {id: 1};
        const onMount = vi.fn(() => resource);
        const firstOnUnmount = vi.fn();
        const secondOnUnmount = vi.fn();

        const {rerender, unmount} = renderHook(
            ({onUnmount}) => useOnMountAndUnmount(onMount, onUnmount),
            {
                initialProps: {
                    onUnmount: firstOnUnmount,
                },
            }
        );

        rerender({
            onUnmount: secondOnUnmount,
        });

        unmount();

        expect(firstOnUnmount).not.toHaveBeenCalled();
        expect(secondOnUnmount).toHaveBeenCalledOnce();
        expect(secondOnUnmount).toHaveBeenCalledWith(resource);
    });
});

describe('useOnLayoutMountAndUnmount', () => {
    it('runs onMount and passes its result to onUnmount', () => {
        const resource = {id: 1};
        const onMount = vi.fn(() => resource);
        const onUnmount = vi.fn();

        const {unmount} = renderHook(() =>
            useOnLayoutMountAndUnmount(onMount, onUnmount)
        );

        expect(onMount).toHaveBeenCalledOnce();
        expect(onUnmount).not.toHaveBeenCalled();

        unmount();

        expect(onUnmount).toHaveBeenCalledOnce();
        expect(onUnmount).toHaveBeenCalledWith(resource);
    });

    it('runs onMount before passive effects', () => {
        const calls: string[] = [];

        renderHook(() => {
            useOnLayoutMountAndUnmount(
                () => {
                    calls.push('layout mount');

                    return 'resource';
                },
                () => {
                    calls.push('layout unmount');
                }
            );

            useEffect(() => {
                calls.push('effect');
            }, []);
        });

        expect(calls).toEqual(['layout mount', 'effect']);
    });

    it('ignores changes to onMount after the initial render', () => {
        const firstResource = {id: 1};
        const secondResource = {id: 2};

        const firstOnMount = vi.fn(() => firstResource);
        const secondOnMount = vi.fn(() => secondResource);
        const onUnmount = vi.fn();

        const {rerender, unmount} = renderHook(
            ({onMount}) => useOnLayoutMountAndUnmount(onMount, onUnmount),
            {
                initialProps: {
                    onMount: firstOnMount,
                },
            }
        );

        rerender({
            onMount: secondOnMount,
        });

        unmount();

        expect(firstOnMount).toHaveBeenCalledOnce();
        expect(secondOnMount).not.toHaveBeenCalled();
        expect(onUnmount).toHaveBeenCalledWith(firstResource);
    });

    it('uses the latest onUnmount callback', () => {
        const resource = {id: 1};
        const onMount = vi.fn(() => resource);
        const firstOnUnmount = vi.fn();
        const secondOnUnmount = vi.fn();

        const {rerender, unmount} = renderHook(
            ({onUnmount}) => useOnLayoutMountAndUnmount(onMount, onUnmount),
            {
                initialProps: {
                    onUnmount: firstOnUnmount,
                },
            }
        );

        rerender({
            onUnmount: secondOnUnmount,
        });

        unmount();

        expect(firstOnUnmount).not.toHaveBeenCalled();
        expect(secondOnUnmount).toHaveBeenCalledOnce();
        expect(secondOnUnmount).toHaveBeenCalledWith(resource);
    });
});
