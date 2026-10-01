import type {Dispatch, SetStateAction} from 'react';
import {useLayoutEffect, useRef} from 'react';

import {useHandler} from './useHandler';
import {useRerender} from './useRerender';

/**
 * A state value or a lazy initializer that produces it.
 */
type StateValue<S> = S | (() => S);

/**
 * Compares two externally provided state values.
 *
 * Returning `true` keeps the current local state. Returning `false` resets it
 * from the newly provided state value.
 */
type StateComparator<S> = (a: StateValue<S>, b: StateValue<S>) => boolean;

/**
 * Mutable container for the current local state value.
 *
 * The value is stored outside React state so it can be updated without
 * scheduling a render automatically. Rendering is triggered explicitly when
 * needed.
 */
interface StateRef<S> {
    value: S;
}

/**
 * Manages local state that is reset when an externally provided state value
 * changes.
 *
 * The hook behaves similarly to `useState` while `stateValue` remains equal
 * according to `isEqual`: the returned setter updates the local state without
 * changing the externally provided value.
 *
 * When `stateValue` changes, the new value replaces the current local state
 * during the same render. The hook does not schedule an additional render just
 * to synchronize the local state with the new external value.
 *
 * `stateValue` may be a value or a lazy initializer function. The initializer
 * is evaluated when its state value needs to become the current state.
 *
 * By default, external state values are compared with `Object.is`. A custom
 * comparator can be supplied when different equality semantics are required.
 *
 * As with React state initializers and functional state updates, a function
 * passed as `stateValue` is treated as an initializer, and a function passed
 * to the setter is treated as an updater. To store a function itself as state,
 * wrap it in another function.
 *
 * @param stateValue - External state value or lazy initializer. When it changes,
 * the local state is reset to the resolved value.
 * @param isEqual - Function used to determine whether the external state value
 * has changed. Defaults to `Object.is`.
 * @returns The current state and a setter compatible with React's
 * `SetStateAction`.
 *
 * @example
 * const [value, setValue] = useUpdatableState(initialValue);
 *
 * setValue('local value');
 * setValue((previous) => update(previous));
 *
 * @example
 * const [page, setPage] = useUpdatableState(props.initialPage);
 *
 * // Local updates are preserved while props.initialPage stays unchanged.
 * setPage((page) => page + 1);
 *
 * // If props.initialPage later changes, the local state is reset to it
 * // without an additional synchronization render.
 */
export function useUpdatableState<S = undefined>(
    stateValue: StateValue<S>,
    isEqual: StateComparator<S> = Object.is
): [S, Dispatch<SetStateAction<S>>] {
    const rerender = useRerender();

    const lastRef = useRef<StateValue<S>>(stateValue);
    const stateRef = useRef<StateRef<S> | null>(null);

    if (stateRef.current === null) {
        stateRef.current = {
            value: getState(stateValue),
        };
    }

    const isUpdated = !isEqual(lastRef.current, stateValue);

    const state = isUpdated ? getState(stateValue) : stateRef.current.value;

    useLayoutEffect(() => {
        if (isUpdated) {
            lastRef.current = stateValue;
            stateRef.current!.value = state;
        }
    }, [isUpdated, stateValue, state]);

    const handleSetState = useHandler((stateUpdater: SetStateAction<S>) => {
        const previousState = stateRef.current!.value;

        const nextState = isStateUpdater(stateUpdater)
            ? stateUpdater(previousState)
            : stateUpdater;

        if (Object.is(previousState, nextState)) {
            return;
        }

        stateRef.current!.value = nextState;
        rerender();
    });

    return [state, handleSetState];
}

function getState<S>(stateValue: StateValue<S>): S {
    return isStateInitializer(stateValue) ? stateValue() : stateValue;
}

function isStateInitializer<S>(value: StateValue<S>): value is () => S {
    return typeof value === 'function';
}

function isStateUpdater<S>(
    value: SetStateAction<S>
): value is (prevState: S) => S {
    return typeof value === 'function';
}
