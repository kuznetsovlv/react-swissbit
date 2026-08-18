import type {OptionsMethods} from '@/types';
import useOptionsRaw from '@/utils/useOptionsRaw';

/**
 * Manages a value selected from a fixed list of options with cyclic navigation.
 *
 * Calling `next` at the last option wraps to the first option. Calling
 * `previous` at the first option wraps to the last option.
 *
 * The options and initial option are captured on the initial render. Changes
 * to either argument on later renders are ignored.
 *
 * The returned methods object and all of its methods have stable references
 * across renders.
 *
 * `NaN` values are currently not supported as options.
 *
 * @param options - Non-empty list of unique available options.
 * @param initialOption - Initially selected option. Defaults to the first option.
 * @returns The currently selected option and methods for navigating the list.
 *
 * @throws If `options` is empty.
 * @throws If `options` contains duplicate values.
 * @throws If `initialOption` is not contained in `options`.
 *
 * @example
 * const [theme, {next, previous}] = useCyclicOptions(
 *     ['light', 'dark', 'system'] as const
 * );
 */
export function useCyclicOptions<T>(
    options: readonly T[],
    initialOption: T = options[0]
): [T, OptionsMethods<T>] {
    return useOptionsRaw({options, option: initialOption}, true);
}
