import type {RefObject} from 'react';
import {useEffect, useRef} from 'react';

import {useHandler} from './useHandler';

type CallbackFunction = (entries: ResizeObserverEntry[]) => void;

type ObservableElement = Element | RefObject<Element | null>;

type ElementCallback = (element: ObservableElement) => void;

/**
 * Observes size changes of one or more elements.
 *
 * Resize notifications are deferred until the next animation frame before
 * `callback` is invoked. This prevents layout changes made by the callback
 * from creating a ResizeObserver notification loop within the same frame.
 *
 * Multiple notifications received before the next animation frame are
 * batched. If the same element produces multiple entries during that time,
 * only its latest entry is passed to the callback.
 *
 * Elements can be added and removed dynamically using the returned `observe`
 * and `unobserve` functions. Both functions accept either an `Element` or a
 * React `RefObject` containing an element.
 *
 * Changing `callback` or `box` recreates the underlying `ResizeObserver`.
 * Currently observed elements are automatically observed again by the new
 * observer. Pass a stable callback when recreation on every render is not
 * desired.
 *
 * The returned `observe` and `unobserve` functions have stable references
 * across renders.
 *
 * Deferring the callback prevents notification loops within a single frame,
 * but does not prevent application-level resize feedback loops that continue
 * across multiple frames.
 *
 * @param callback - Function called with the latest resize entries on the next
 * animation frame.
 * @param box - Box model to observe. Defaults to `content-box`.
 * @returns Stable functions for starting and stopping observation of elements.
 *
 * @example
 * const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
 *     for (const entry of entries) {
 *         console.log(entry.contentRect.width);
 *     }
 * }, []);
 *
 * const [observe, unobserve] = useResizeObserver(handleResize);
 *
 * useEffect(() => {
 *     const element = ref.current;
 *
 *     if (!element) {
 *         return;
 *     }
 *
 *     observe(element);
 *
 *     return () => {
 *         unobserve(element);
 *     };
 * }, [observe, unobserve]);
 */
export function useResizeObserver(
    callback: CallbackFunction,
    box: ResizeObserverBoxOptions = 'content-box'
): [observe: ElementCallback, unobserve: ElementCallback] {
    const observerRef = useRef<ResizeObserver | null>(null);
    const elementSetRef = useRef<Set<Element>>(new Set());

    useEffect(() => {
        let frameId: number | null = null;

        const pendingEntries = new Map<Element, ResizeObserverEntry>();

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                pendingEntries.set(entry.target, entry);
            }

            if (frameId !== null) {
                return;
            }

            frameId = requestAnimationFrame(() => {
                frameId = null;
                const entries = [...pendingEntries.values()];
                pendingEntries.clear();

                if (entries.length) {
                    callback(entries);
                }
            });
        });
        observerRef.current = observer;

        for (const element of elementSetRef.current) {
            observer.observe(element, {box});
        }

        return () => {
            if (frameId !== null) {
                cancelAnimationFrame(frameId);
            }

            observer.disconnect();

            if (observerRef.current === observer) {
                observerRef.current = null;
            }
        };
    }, [callback, box]);

    const observe: ElementCallback = useHandler((element) => {
        const observationElement =
            element instanceof Element ? element : element.current;
        if (observationElement) {
            elementSetRef.current.add(observationElement);
            observerRef.current?.observe(observationElement, {box});
        }
    });

    const unobserve: ElementCallback = useHandler((element) => {
        const observationElement =
            element instanceof Element ? element : element.current;
        if (observationElement) {
            elementSetRef.current.delete(observationElement);
            observerRef.current?.unobserve(observationElement);
        }
    });

    return [observe, unobserve];
}
