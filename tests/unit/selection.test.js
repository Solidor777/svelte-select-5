import { expect, test } from 'vitest';
import { coerceValue, computeJustValue } from '../../src/lib/selection.svelte.js';

test('coerceValue maps a string to a matching item', () => {
    const items = [{ value: 'a', label: 'Apple' }];
    expect(coerceValue('a', { items, itemId: 'value', multiple: false, label: 'label' })).toEqual(items[0]);
});

test('coerceValue wraps an unmatched string', () => {
    expect(coerceValue('z', { items: [], itemId: 'value', multiple: false, label: 'label' }))
        .toEqual({ value: 'z', label: 'z' });
});

test('coerceValue maps string entries in multiple arrays', () => {
    expect(coerceValue(['x'], { items: [], itemId: 'value', multiple: true, label: 'label' }))
        .toEqual([{ value: 'x', label: 'x' }]);
});

test('coerceValue leaves object values untouched', () => {
    const v = { value: 1, label: 'one' };
    expect(coerceValue(v, { items: [], itemId: 'value', multiple: false, label: 'label' })).toBe(v);
});

test('computeJustValue projects itemId for single and multiple', () => {
    expect(computeJustValue({ value: 1, label: 'one' }, 'value', false)).toBe(1);
    expect(computeJustValue([{ value: 1 }, { value: 2 }], 'value', true)).toEqual([1, 2]);
    expect(computeJustValue(null, 'value', false)).toBe(null);
    expect(computeJustValue(null, 'value', true)).toBe(null);
});
