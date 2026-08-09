import {useEffect, useLayoutEffect, useRef} from 'react';

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
    const ref = useRef(fn);

    useLayoutEffect(() => {
        ref.current = fn;
    }, [fn]);

    useEffect(
        () => () => {
            ref.current();
        },
        []
    );
}
