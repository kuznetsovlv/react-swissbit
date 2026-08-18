export interface OptionsMethods<T> {
    /** Selects the next option, if available. */
    next: () => void;

    /** Selects the previous option, if available. */
    previous: () => void;

    /** Selects the first option. */
    begin: () => void;

    /** Selects the last option. */
    end: () => void;

    /**
     * Selects the specified option.
     *
     * @throws If `value` is not one of the configured options.
     */
    set: (value: T) => void;
}
