import {useMemo, useState} from 'react';

import type {OptionsMethods} from '@/types';

interface OptionsData<T> {
    options: readonly T[];
    option: T;
}

/**
 * Internal implementation shared by `useOptions` and `useCyclicOptions`.
 */
function useOptionsRaw<T>(
    initial: OptionsData<T>,
    isCyclic: boolean
): [T, OptionsMethods<T>] {
    const [{option}, setData] = useState<OptionsData<T>>(() => {
        const {options, option} = initial;

        if (!Array.isArray(options) || !options.length) {
            throw new Error(
                'Argument options must be an array with at least one element'
            );
        }

        if (new Set(options).size !== options.length) {
            throw new Error(
                'Argument options must not contain duplicate elements'
            );
        }

        if (!options.includes(option)) {
            throw new Error(
                'Argument initialOption must be an element of options'
            );
        }

        return {option, options: [...options]};
    });

    const methods = useMemo<OptionsMethods<T>>(() => {
        return {
            next: () =>
                setData((data) => {
                    const {option, options} = data;
                    const nextIndex = options.indexOf(option) + 1;
                    if (nextIndex < options.length || isCyclic) {
                        return {
                            options,
                            option: options[nextIndex % options.length],
                        };
                    }
                    return data;
                }),
            previous: () =>
                setData((data) => {
                    const {option, options} = data;
                    const prevIndex = options.indexOf(option) - 1;
                    if (prevIndex >= 0 || isCyclic) {
                        return {
                            options,
                            option: options[
                                (prevIndex + options.length) % options.length
                            ],
                        };
                    }
                    return data;
                }),
            begin: () =>
                setData((data) => {
                    const option = data.options[0];
                    return data.option === option ? data : {...data, option};
                }),
            end: () =>
                setData((data) => {
                    const option = data.options[data.options.length - 1];
                    return data.option === option ? data : {...data, option};
                }),
            set: (value: T) =>
                setData((data) => {
                    if (!data.options.includes(value)) {
                        throw new Error(
                            'Argument value must be an element of options'
                        );
                    }

                    return data.option === value
                        ? data
                        : {...data, option: value};
                }),
        };
    }, [isCyclic]);

    return [option, methods];
}

export default useOptionsRaw;
