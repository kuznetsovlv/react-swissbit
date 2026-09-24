import {useEffect, useLayoutEffect} from 'react';

import {useHandler} from './useHandler';

type FunctionType = () => void;

/**
 * Runs a callback after the component is mounted.
 *
 * The callback is invoked once after the initial committed render.
 *
 * @param fn - The callback to invoke after mount.
 *
 * @example
 * useOnMount(() => {
 *     console.log('Mounted');
 * });
 */
export function useOnMount(fn: FunctionType): void {
    useEffect(() => {
        fn();
    }, []);
}

/**
 * Runs a callback synchronously after the component is mounted but before the
 * browser repaints the screen.
 *
 * This hook uses `useLayoutEffect` and should only be used when the callback
 * needs to run before paint, for example when measuring or synchronously
 * adjusting layout.
 *
 * @param fn - The callback to invoke after mount and before paint.
 *
 * @example
 * useOnLayoutMount(() => {
 *     measureLayout();
 * });
 */
export function useOnLayoutMount(fn: FunctionType): void {
    useLayoutEffect(() => {
        fn();
    }, []);
}

/**
 * Runs the latest provided callback when the component is unmounted.
 *
 * Updating `fn` does not register a new unmount effect. The latest callback
 * from the most recently committed render is invoked on unmount.
 *
 * @param fn - The callback to invoke on unmount.
 *
 * @example
 * useOnUnmount(() => {
 *     connection.close();
 * });
 */
export function useOnUnmount(fn: FunctionType): void {
    const handleUnmount = useHandler(fn);

    useEffect(
        () => () => {
            handleUnmount();
        },
        []
    );
}

/**
 * Setup callback invoked on mount.
 *
 * The returned value is preserved and passed to the corresponding cleanup
 * callback.
 */
type MountCallback<T> = () => T;

/**
 * Cleanup callback invoked on unmount.
 *
 * Receives the value returned by the corresponding setup callback.
 */
type UnmountCallback<T> = (arg: T) => void;

/**
 * Runs a setup callback after the component is mounted and passes its result
 * to the latest cleanup callback when the component is unmounted.
 *
 * `onMount` is invoked after the initial committed render. Its return value is
 * preserved and later passed to `onUnmount`.
 *
 * Changes to `onMount` after the initial render are ignored. The latest
 * `onUnmount` callback from the most recently committed render is used for
 * cleanup.
 *
 * In React Strict Mode, development builds may run an additional setup and
 * cleanup cycle. Each cleanup receives the value returned by its corresponding
 * setup call.
 *
 * @param onMount - The setup callback to invoke after mount.
 * @param onUnmount - The cleanup callback to invoke with the value returned by
 * `onMount`.
 *
 * @example
 * useOnMountAndUnmount(
 *     () => new WebSocket(url),
 *     (socket) => {
 *         socket.close();
 *     }
 * );
 */
export function useOnMountAndUnmount<T>(
    onMount: MountCallback<T>,
    onUnmount: UnmountCallback<T>
): void {
    const handleUnmount = useHandler(onUnmount);

    useEffect(() => {
        const arg = onMount();

        return () => {
            handleUnmount(arg);
        };
    }, []);
}

/**
 * Runs a setup callback synchronously after the component is mounted but before
 * the browser repaints the screen, and passes its result to the latest cleanup
 * callback when the layout effect is cleaned up.
 *
 * `onMount` is invoked during the initial layout effect. Its return value is
 * preserved and later passed to `onUnmount`.
 *
 * Changes to `onMount` after the initial render are ignored. The latest
 * `onUnmount` callback from the most recently committed render is used for
 * cleanup.
 *
 * This hook uses `useLayoutEffect` and should only be used when setup or cleanup
 * needs to run as part of the layout effect lifecycle, for example when working
 * with DOM measurements or synchronous layout-related resources.
 *
 * In React Strict Mode, development builds may run an additional setup and
 * cleanup cycle. Each cleanup receives the value returned by its corresponding
 * setup call.
 *
 * @param onMount - The setup callback to invoke after mount and before paint.
 * @param onUnmount - The cleanup callback to invoke with the value returned by
 * `onMount`.
 *
 * @example
 * useOnLayoutMountAndUnmount(
 *     () => element.getBoundingClientRect(),
 *     (initialRect) => {
 *         console.log(initialRect);
 *     }
 * );
 */
export function useOnLayoutMountAndUnmount<T>(
    onMount: MountCallback<T>,
    onUnmount: UnmountCallback<T>
): void {
    const handleUnmount = useHandler(onUnmount);

    useLayoutEffect(() => {
        const arg = onMount();

        return () => {
            handleUnmount(arg);
        };
    }, []);
}
