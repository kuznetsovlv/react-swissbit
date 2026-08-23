// @vitest-environment jsdom

import {act, cleanup, renderHook} from '@testing-library/react';
import type {RefObject} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {useResizeObserver} from './useResizeObserver';

type CallbackFunction = (entries: ResizeObserverEntry[]) => void;

class ResizeObserverMock {
    static instances: ResizeObserverMock[] = [];

    readonly observe = vi.fn();
    readonly unobserve = vi.fn();
    readonly disconnect = vi.fn();

    private readonly callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
        ResizeObserverMock.instances.push(this);
    }

    trigger(entries: ResizeObserverEntry[]): void {
        this.callback(entries, this as unknown as ResizeObserver);
    }
}

let frames = new Map<number, FrameRequestCallback>();
let nextFrameId = 1;

const requestAnimationFrameMock = vi.fn(
    (callback: FrameRequestCallback): number => {
        const id = nextFrameId++;
        frames.set(id, callback);

        return id;
    }
);

const cancelAnimationFrameMock = vi.fn((id: number): void => {
    frames.delete(id);
});

function flushAnimationFrame(): void {
    const callbacks = [...frames.values()];
    frames.clear();

    for (const callback of callbacks) {
        callback(0);
    }
}

function createEntry(target: Element): ResizeObserverEntry {
    return {target} as ResizeObserverEntry;
}

function getLatestObserver(): ResizeObserverMock {
    const observer = ResizeObserverMock.instances.at(-1);

    if (!observer) {
        throw new Error('ResizeObserver was not created');
    }

    return observer;
}

describe('useResizeObserver', () => {
    beforeEach(() => {
        ResizeObserverMock.instances = [];
        frames = new Map();
        nextFrameId = 1;

        requestAnimationFrameMock.mockClear();
        cancelAnimationFrameMock.mockClear();

        vi.stubGlobal('ResizeObserver', ResizeObserverMock);
        vi.stubGlobal('requestAnimationFrame', requestAnimationFrameMock);
        vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameMock);
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it('observes an element using content-box by default', () => {
        const callback: CallbackFunction = vi.fn();

        const {result} = renderHook(() => useResizeObserver(callback));

        const element = document.createElement('div');
        const observer = getLatestObserver();

        act(() => {
            result.current[0](element);
        });

        expect(observer.observe).toHaveBeenCalledWith(element, {
            box: 'content-box',
        });
    });

    it('observes an element using the provided box', () => {
        const callback: CallbackFunction = vi.fn();

        const {result} = renderHook(() =>
            useResizeObserver(callback, 'border-box')
        );

        const element = document.createElement('div');
        const observer = getLatestObserver();

        act(() => {
            result.current[0](element);
        });

        expect(observer.observe).toHaveBeenCalledWith(element, {
            box: 'border-box',
        });
    });

    it('accepts a RefObject when observing an element', () => {
        const callback: CallbackFunction = vi.fn();

        const {result} = renderHook(() => useResizeObserver(callback));

        const element = document.createElement('div');
        const ref: RefObject<Element | null> = {
            current: element,
        };

        const observer = getLatestObserver();

        act(() => {
            result.current[0](ref);
        });

        expect(observer.observe).toHaveBeenCalledWith(element, {
            box: 'content-box',
        });
    });

    it('unobserves an element', () => {
        const callback: CallbackFunction = vi.fn();

        const {result} = renderHook(() => useResizeObserver(callback));

        const element = document.createElement('div');
        const observer = getLatestObserver();

        act(() => {
            result.current[0](element);
            result.current[1](element);
        });

        expect(observer.unobserve).toHaveBeenCalledWith(element);
    });

    it('defers the callback until the next animation frame', () => {
        const callback: CallbackFunction = vi.fn();

        renderHook(() => useResizeObserver(callback));

        const element = document.createElement('div');
        const entry = createEntry(element);
        const observer = getLatestObserver();

        act(() => {
            observer.trigger([entry]);
        });

        expect(callback).not.toHaveBeenCalled();

        act(() => {
            flushAnimationFrame();
        });

        expect(callback).toHaveBeenCalledOnce();
        expect(callback).toHaveBeenCalledWith([entry]);
    });

    it('batches notifications received before the next animation frame', () => {
        const callback: CallbackFunction = vi.fn();

        renderHook(() => useResizeObserver(callback));

        const firstElement = document.createElement('div');
        const secondElement = document.createElement('div');

        const firstEntry = createEntry(firstElement);
        const secondEntry = createEntry(secondElement);

        const observer = getLatestObserver();

        act(() => {
            observer.trigger([firstEntry]);
            observer.trigger([secondEntry]);
        });

        expect(requestAnimationFrameMock).toHaveBeenCalledOnce();
        expect(callback).not.toHaveBeenCalled();

        act(() => {
            flushAnimationFrame();
        });

        expect(callback).toHaveBeenCalledOnce();

        const entries = vi.mocked(callback).mock.calls[0][0];

        expect(entries).toHaveLength(2);
        expect(entries).toContain(firstEntry);
        expect(entries).toContain(secondEntry);
    });

    it('keeps only the latest entry for each element within a frame', () => {
        const callback: CallbackFunction = vi.fn();

        renderHook(() => useResizeObserver(callback));

        const firstElement = document.createElement('div');
        const secondElement = document.createElement('div');

        const firstEntry = createEntry(firstElement);
        const latestFirstEntry = createEntry(firstElement);
        const secondEntry = createEntry(secondElement);

        const observer = getLatestObserver();

        act(() => {
            observer.trigger([firstEntry]);
            observer.trigger([secondEntry, latestFirstEntry]);
        });

        act(() => {
            flushAnimationFrame();
        });

        const entries = vi.mocked(callback).mock.calls[0][0];

        expect(entries).toHaveLength(2);
        expect(entries).not.toContain(firstEntry);
        expect(entries).toContain(latestFirstEntry);
        expect(entries).toContain(secondEntry);
    });

    it('cancels a pending animation frame on unmount', () => {
        const callback: CallbackFunction = vi.fn();

        const {unmount} = renderHook(() => useResizeObserver(callback));

        const observer = getLatestObserver();
        const entry = createEntry(document.createElement('div'));

        act(() => {
            observer.trigger([entry]);
        });

        unmount();

        expect(cancelAnimationFrameMock).toHaveBeenCalledOnce();
        expect(observer.disconnect).toHaveBeenCalledOnce();

        act(() => {
            flushAnimationFrame();
        });

        expect(callback).not.toHaveBeenCalled();
    });

    it('recreates the observer when the callback changes', () => {
        const firstCallback: CallbackFunction = vi.fn();
        const secondCallback: CallbackFunction = vi.fn();

        const {result, rerender} = renderHook(
            ({callback}: {callback: CallbackFunction}) =>
                useResizeObserver(callback),
            {
                initialProps: {
                    callback: firstCallback,
                },
            }
        );

        const element = document.createElement('div');

        act(() => {
            result.current[0](element);
        });

        const firstObserver = getLatestObserver();

        rerender({
            callback: secondCallback,
        });

        const secondObserver = getLatestObserver();

        expect(secondObserver).not.toBe(firstObserver);
        expect(firstObserver.disconnect).toHaveBeenCalledOnce();

        expect(secondObserver.observe).toHaveBeenCalledWith(element, {
            box: 'content-box',
        });

        const entry = createEntry(element);

        act(() => {
            secondObserver.trigger([entry]);
            flushAnimationFrame();
        });

        expect(firstCallback).not.toHaveBeenCalled();
        expect(secondCallback).toHaveBeenCalledWith([entry]);
    });

    it('recreates the observer when box changes', () => {
        const callback: CallbackFunction = vi.fn();

        const {result, rerender} = renderHook(
            ({box}: {box: ResizeObserverBoxOptions}) =>
                useResizeObserver(callback, box),
            {
                initialProps: {
                    box: 'content-box' as ResizeObserverBoxOptions,
                },
            }
        );

        const element = document.createElement('div');

        act(() => {
            result.current[0](element);
        });

        const firstObserver = getLatestObserver();

        rerender({
            box: 'border-box',
        });

        const secondObserver = getLatestObserver();

        expect(firstObserver.disconnect).toHaveBeenCalledOnce();

        expect(secondObserver.observe).toHaveBeenCalledWith(element, {
            box: 'border-box',
        });
    });

    it('does not observe a removed element after observer recreation', () => {
        const firstCallback: CallbackFunction = vi.fn();
        const secondCallback: CallbackFunction = vi.fn();

        const {result, rerender} = renderHook(
            ({callback}: {callback: CallbackFunction}) =>
                useResizeObserver(callback),
            {
                initialProps: {
                    callback: firstCallback,
                },
            }
        );

        const element = document.createElement('div');

        act(() => {
            result.current[0](element);
            result.current[1](element);
        });

        rerender({
            callback: secondCallback,
        });

        const observer = getLatestObserver();

        expect(observer.observe).not.toHaveBeenCalled();
    });

    it('keeps observe and unobserve references stable across renders', () => {
        const firstCallback: CallbackFunction = vi.fn();
        const secondCallback: CallbackFunction = vi.fn();

        const {result, rerender} = renderHook(
            ({callback}: {callback: CallbackFunction}) =>
                useResizeObserver(callback),
            {
                initialProps: {
                    callback: firstCallback,
                },
            }
        );

        const observe = result.current[0];
        const unobserve = result.current[1];

        rerender({
            callback: secondCallback,
        });

        expect(result.current[0]).toBe(observe);
        expect(result.current[1]).toBe(unobserve);
    });

    it('keeps observed elements unique when the observer is recreated', () => {
        const firstCallback: CallbackFunction = vi.fn();
        const secondCallback: CallbackFunction = vi.fn();

        const {result, rerender} = renderHook(
            ({callback}: {callback: CallbackFunction}) =>
                useResizeObserver(callback),
            {
                initialProps: {
                    callback: firstCallback,
                },
            }
        );

        const element = document.createElement('div');

        act(() => {
            result.current[0](element);
            result.current[0](element);
        });

        rerender({
            callback: secondCallback,
        });

        const observer = getLatestObserver();

        expect(observer.observe).toHaveBeenCalledTimes(1);
        expect(observer.observe).toHaveBeenCalledWith(element, {
            box: 'content-box',
        });
    });
});
