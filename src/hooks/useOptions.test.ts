// @vitest-environment jsdom

import {act, renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {useOptions} from './useOptions';

describe('useOptions', () => {
    it('uses the first option by default', () => {
        const {result} = renderHook(() =>
            useOptions(['first', 'second', 'third'])
        );

        expect(result.current[0]).toBe('first');
    });

    it('uses the provided initial option', () => {
        const {result} = renderHook(() =>
            useOptions(['first', 'second', 'third'], 'second')
        );

        expect(result.current[0]).toBe('second');
    });

    it('moves to the next option', () => {
        const {result} = renderHook(() =>
            useOptions(['first', 'second', 'third'])
        );

        act(() => {
            result.current[1].next();
        });

        expect(result.current[0]).toBe('second');

        act(() => {
            result.current[1].next();
        });

        expect(result.current[0]).toBe('third');
    });

    it('stays at the last option when next is called at the end', () => {
        const {result} = renderHook(() =>
            useOptions(['first', 'second'], 'second')
        );

        act(() => {
            result.current[1].next();
        });

        expect(result.current[0]).toBe('second');
    });

    it('moves to the previous option', () => {
        const {result} = renderHook(() =>
            useOptions(['first', 'second', 'third'], 'third')
        );

        act(() => {
            result.current[1].previous();
        });

        expect(result.current[0]).toBe('second');

        act(() => {
            result.current[1].previous();
        });

        expect(result.current[0]).toBe('first');
    });

    it('stays at the first option when previous is called at the beginning', () => {
        const {result} = renderHook(() => useOptions(['first', 'second']));

        act(() => {
            result.current[1].previous();
        });

        expect(result.current[0]).toBe('first');
    });

    it('moves to the first option', () => {
        const {result} = renderHook(() =>
            useOptions(['first', 'second', 'third'], 'third')
        );

        act(() => {
            result.current[1].begin();
        });

        expect(result.current[0]).toBe('first');
    });

    it('moves to the last option', () => {
        const {result} = renderHook(() =>
            useOptions(['first', 'second', 'third'])
        );

        act(() => {
            result.current[1].end();
        });

        expect(result.current[0]).toBe('third');
    });

    it('sets an option explicitly', () => {
        const {result} = renderHook(() =>
            useOptions(['first', 'second', 'third'])
        );

        act(() => {
            result.current[1].set('second');
        });

        expect(result.current[0]).toBe('second');
    });

    it('throws when setting a value that is not an option', () => {
        const {result} = renderHook(() => useOptions(['first', 'second']));

        expect(() => {
            act(() => {
                result.current[1].set('third');
            });
        }).toThrow('Argument value must be an element of options');
    });

    it('supports a single option', () => {
        const {result} = renderHook(() => useOptions(['only']));

        act(() => {
            result.current[1].next();
            result.current[1].previous();
            result.current[1].begin();
            result.current[1].end();
        });

        expect(result.current[0]).toBe('only');
    });

    it('throws when options is empty', () => {
        expect(() => {
            renderHook(() => useOptions<string>([]));
        }).toThrow(
            'Argument options must be an array with at least one element'
        );
    });

    it('throws when options contain duplicates', () => {
        expect(() => {
            renderHook(() => useOptions(['first', 'first']));
        }).toThrow('Argument options must not contain duplicate elements');
    });

    it('throws when the initial option is not in options', () => {
        expect(() => {
            renderHook(() => useOptions(['first', 'second'], 'third'));
        }).toThrow('Argument initialOption must be an element of options');
    });

    it('keeps the methods object stable across state changes', () => {
        const {result} = renderHook(() => useOptions(['first', 'second']));

        const methods = result.current[1];

        act(() => {
            methods.next();
        });

        expect(result.current[1]).toBe(methods);
    });

    it('ignores changes to options after the initial render', () => {
        const {result, rerender} = renderHook(
            ({options}) => useOptions(options),
            {
                initialProps: {
                    options: ['first', 'second'],
                },
            }
        );

        rerender({
            options: ['third', 'fourth'],
        });

        act(() => {
            result.current[1].next();
        });

        expect(result.current[0]).toBe('second');
    });

    it('ignores changes to the initial option after the initial render', () => {
        const options = ['first', 'second', 'third'];

        const {result, rerender} = renderHook(
            ({initialOption}) => useOptions(options, initialOption),
            {
                initialProps: {
                    initialOption: 'first',
                },
            }
        );

        rerender({
            initialOption: 'third',
        });

        expect(result.current[0]).toBe('first');
    });

    it('preserves object references', () => {
        const first = {id: 1};
        const second = {id: 2};

        const {result} = renderHook(() => useOptions([first, second]));

        act(() => {
            result.current[1].next();
        });

        expect(result.current[0]).toBe(second);
    });
});
