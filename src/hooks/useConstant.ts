import {useState} from 'react';

/**
 * Returns the value provided on the initial render and keeps it unchanged
 * for the lifetime of the component.
 *
 * Values passed on later renders are ignored.
 *
 * The value is preserved as-is, including object and function references.
 *
 * @param value - The value to preserve from the initial render.
 * @returns The value provided on the initial render.
 *
 * @example
 * const initialOptions = useConstant(options);
 */
export function useConstant<T>(value: T): T {
    const [constant] = useState<T>(() => value);

    return constant;
}
