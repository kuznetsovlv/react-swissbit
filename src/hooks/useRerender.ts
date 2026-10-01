import {useState} from 'react';

import {useHandler} from './useHandler';

/**
 * Returns a stable function that forces the component to rerender.
 *
 * Calling the returned function schedules a render without changing any
 * application state exposed by the hook.
 *
 * The returned function keeps the same reference across renders.
 *
 * Forcing renders manually is generally an anti-pattern and should be avoided
 * when normal React state, props, context, or external-store subscriptions can
 * model the same behavior.
 *
 * Needing this hook is a good reason to reconsider the component's state model
 * and architecture before using it. It should primarily be treated as an
 * escape hatch for cases where mutable state intentionally lives outside
 * React's normal state model.
 *
 * @returns A stable function that schedules a component rerender.
 *
 * @example
 * const rerender = useRerender();
 *
 * const handleChange = () => {
 *     valueRef.current++;
 *     rerender();
 * };
 */
export function useRerender(): () => void {
    const [, setValue] = useState<object>({});

    return useHandler(() => setValue({}));
}
