import {useRef, useEffect} from 'react';

/**
 * Returns the value from the previous committed render.
 *
 * On the initial render, returns `initialPreviousValue` when provided,
 * otherwise returns `undefined`.
 *
 * @param value - The current value to remember for the next render.
 * @param initialPreviousValue - Optional value to return on the initial render.
 * @returns The value from the previous committed render.
 *
 * @example
 * const previousCount = usePrevious(count);
 *
 * @example
 * const previousCount = usePrevious(count, 0);
 */
export function usePrevious<T>(value: T): T | undefined;
export function usePrevious<T>(value: T, initialPreviousValue: T): T;

export function usePrevious<T>(
    value: T,
    initialPreviousValue?: T
): T | undefined {
    const ref = useRef<T | undefined>(initialPreviousValue);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}
