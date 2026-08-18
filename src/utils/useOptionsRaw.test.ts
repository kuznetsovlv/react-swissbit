// @vitest-environment jsdom

import {act, renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import useOptionsRaw from './useOptionsRaw';

describe('useOptionsRaw', () => {
    describe('initialization', () => {
        it('uses the provided initial option', () => {
            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options: ['first', 'second', 'third'],
                        option: 'second',
                    },
                    false
                )
            );

            expect(result.current[0]).toBe('second');
        });

        it('supports a single option', () => {
            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options: ['only'],
                        option: 'only',
                    },
                    false
                )
            );

            expect(result.current[0]).toBe('only');
        });

        it('throws when options is empty', () => {
            expect(() => {
                renderHook(() =>
                    useOptionsRaw(
                        {
                            options: [],
                            option: 'first',
                        },
                        false
                    )
                );
            }).toThrow(
                'Argument options must be an array with at least one element'
            );
        });

        it('throws when options contain duplicates', () => {
            expect(() => {
                renderHook(() =>
                    useOptionsRaw(
                        {
                            options: ['first', 'first'],
                            option: 'first',
                        },
                        false
                    )
                );
            }).toThrow('Argument options must not contain duplicate elements');
        });

        it('throws when the initial option is not in options', () => {
            expect(() => {
                renderHook(() =>
                    useOptionsRaw(
                        {
                            options: ['first', 'second'],
                            option: 'third',
                        },
                        false
                    )
                );
            }).toThrow('Argument initialOption must be an element of options');
        });
    });

    describe('navigation', () => {
        it('moves to the next option', () => {
            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options: ['first', 'second', 'third'],
                        option: 'first',
                    },
                    false
                )
            );

            act(() => {
                result.current[1].next();
            });

            expect(result.current[0]).toBe('second');
        });

        it('moves to the previous option', () => {
            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options: ['first', 'second', 'third'],
                        option: 'third',
                    },
                    false
                )
            );

            act(() => {
                result.current[1].previous();
            });

            expect(result.current[0]).toBe('second');
        });

        it('stays at the last option when next is called in non-cyclic mode', () => {
            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options: ['first', 'second'],
                        option: 'second',
                    },
                    false
                )
            );

            act(() => {
                result.current[1].next();
            });

            expect(result.current[0]).toBe('second');
        });

        it('stays at the first option when previous is called in non-cyclic mode', () => {
            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options: ['first', 'second'],
                        option: 'first',
                    },
                    false
                )
            );

            act(() => {
                result.current[1].previous();
            });

            expect(result.current[0]).toBe('first');
        });

        it('wraps from the last option to the first in cyclic mode', () => {
            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options: ['first', 'second', 'third'],
                        option: 'third',
                    },
                    true
                )
            );

            act(() => {
                result.current[1].next();
            });

            expect(result.current[0]).toBe('first');
        });

        it('wraps from the first option to the last in cyclic mode', () => {
            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options: ['first', 'second', 'third'],
                        option: 'first',
                    },
                    true
                )
            );

            act(() => {
                result.current[1].previous();
            });

            expect(result.current[0]).toBe('third');
        });

        it('moves to the first option with begin', () => {
            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options: ['first', 'second', 'third'],
                        option: 'third',
                    },
                    false
                )
            );

            act(() => {
                result.current[1].begin();
            });

            expect(result.current[0]).toBe('first');
        });

        it('moves to the last option with end', () => {
            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options: ['first', 'second', 'third'],
                        option: 'first',
                    },
                    false
                )
            );

            act(() => {
                result.current[1].end();
            });

            expect(result.current[0]).toBe('third');
        });
    });

    describe('set', () => {
        it('sets an option explicitly', () => {
            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options: ['first', 'second', 'third'],
                        option: 'first',
                    },
                    false
                )
            );

            act(() => {
                result.current[1].set('third');
            });

            expect(result.current[0]).toBe('third');
        });

        it('throws when setting a value outside options', () => {
            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options: ['first', 'second'],
                        option: 'first',
                    },
                    false
                )
            );

            expect(() => {
                act(() => {
                    result.current[1].set('third');
                });
            }).toThrow('Argument value must be an element of options');
        });
    });

    describe('stability', () => {
        it('keeps the methods object stable across state changes', () => {
            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options: ['first', 'second'],
                        option: 'first',
                    },
                    false
                )
            );

            const methods = result.current[1];

            act(() => {
                methods.next();
            });

            expect(result.current[1]).toBe(methods);
        });

        it('preserves option references', () => {
            const first = {id: 1};
            const second = {id: 2};

            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options: [first, second],
                        option: first,
                    },
                    false
                )
            );

            act(() => {
                result.current[1].next();
            });

            expect(result.current[0]).toBe(second);
        });
    });

    describe('initial snapshot', () => {
        it('keeps the initial options when the source array is mutated', () => {
            const options = ['first', 'second'];

            const {result} = renderHook(() =>
                useOptionsRaw(
                    {
                        options,
                        option: 'first',
                    },
                    false
                )
            );

            options[1] = 'changed';

            act(() => {
                result.current[1].next();
            });

            expect(result.current[0]).toBe('second');
        });
    });

    it('keeps the only option selected in cyclic mode', () => {
        const {result} = renderHook(() =>
            useOptionsRaw(
                {
                    options: ['only'],
                    option: 'only',
                },
                true
            )
        );

        act(() => {
            result.current[1].next();
            result.current[1].previous();
        });

        expect(result.current[0]).toBe('only');
    });
});
