import {useMemo, useState} from 'react';

type Method = () => void;

interface Methods {
    /** Sets the value to `true`. */
    on: Method;

    /** Sets the value to `false`. */
    off: Method;

    /** Inverts the current value. */
    toggle: Method;

    /** Sets the value explicitly. */
    set: (value: boolean) => void;
}

/**
 * Manages a boolean state and provides convenience methods for changing it.
 *
 * `initialValue` is used only for the initial state. Changing it on a later
 * render does not reset the current value.
 *
 * @param initialValue - Initial boolean value.
 * @returns The current value and methods for updating it.
 *
 * @example
 * const [isOpen, {on, off, toggle, set}] = useToggle(false);
 *
 * on();
 * off();
 * toggle();
 * set(true);
 */
export function useToggle(initialValue: boolean): [boolean, Methods] {
    const [value, setValue] = useState(initialValue);

    const methods = useMemo<Methods>(
        () => ({
            on: () => setValue(true),
            off: () => setValue(false),
            toggle: () => setValue((x) => !x),
            set: setValue,
        }),
        []
    );

    return [value, methods];
}
