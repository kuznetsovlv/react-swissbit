import {describe, expect, it} from 'vitest';

import * as publicApi from './index';

describe('public API', () => {
    it('does not expose unfinished utilities', () => {
        expect(Object.keys(publicApi)).toEqual([]);
    });
});
