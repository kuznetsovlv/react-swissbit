import {useCallback, useLayoutEffect, useRef} from 'react';

type FunctionType = (...args: never[]) => unknown;

/**
 * Returns a stable function that always calls the latest provided handler.
 *
 * The returned function keeps the same reference across renders while the
 * handler it invokes is updated after each committed render.
 *
 * This is useful when a callback should always use the latest props or state
 * without requiring consumers of the callback to react to reference changes.
 *
 * @param fn - The handler to invoke.
 * @returns A stable function with the same parameters and return type as `fn`.
 *
 * @example
 * const handleClick = useHandler(() => {
 *     console.log(count);
 * });
 */
export function useHandler<F extends FunctionType>(fn: F): F {
    const ref = useRef(fn);

    useLayoutEffect(() => {
        ref.current = fn;
    }, [fn]);

    return useCallback(
        (...args: Parameters<F>) => ref.current(...args),
        []
    ) as F;
}
