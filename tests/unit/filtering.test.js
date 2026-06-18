import { describe, expect, test, vi } from 'vitest';
import { filterItems, convertStringItemsToObjects, loadAndConvert } from '../../src/lib/filtering.svelte.js';

const itemFilter = (label, filterText) => `${label}`.toLowerCase().includes(filterText.toLowerCase());
const base = { itemId: 'value', label: 'label', filterSelectedItems: true, itemFilter, convertStringItemsToObjects };

describe('filterItems', () => {
    test('filters by filterText', () => {
        const items = [{ value: 1, label: 'one' }, { value: 2, label: 'two' }];
        expect(filterItems({ ...base, items, filterText: 'two', multiple: false, value: null })).toEqual([items[1]]);
    });

    test('converts string items to objects before filtering', () => {
        const out = filterItems({ ...base, items: ['a', 'b'], filterText: 'a', multiple: false, value: null });
        expect(out).toEqual([{ index: 0, value: 'a', label: 'a' }]);
    });

    test('hides already-selected items when multiple', () => {
        const items = [{ value: 1, label: 'one' }, { value: 2, label: 'two' }];
        const out = filterItems({ ...base, items, filterText: '', multiple: true, value: [{ value: 1, label: 'one' }] });
        expect(out).toEqual([items[1]]);
    });

    test('returns items unchanged when loadOptions present', () => {
        const items = [{ value: 1, label: 'one' }];
        expect(filterItems({ ...base, items, loadOptions: () => {}, filterText: 'zzz', multiple: false, value: null })).toBe(items);
    });

    test('returns empty array when items is null', () => {
        expect(filterItems({ ...base, items: null, filterText: '', multiple: false, value: null })).toEqual([]);
    });
});

describe('convertStringItemsToObjects', () => {
    test('maps strings to indexed objects', () => {
        expect(convertStringItemsToObjects(['x', 'y'])).toEqual([
            { index: 0, value: 'x', label: 'x' },
            { index: 1, value: 'y', label: 'y' },
        ]);
    });
});

describe('loadAndConvert', () => {
    test('calls onLoaded and returns open state on success', async () => {
        const onLoaded = vi.fn();
        const res = await loadAndConvert({
            loadOptions: async () => [{ value: 1, label: 'one' }],
            filterText: 'o', convertStringItemsToObjects, onError: vi.fn(), onLoaded,
        });
        expect(onLoaded).toHaveBeenCalledWith({ items: [{ value: 1, label: 'one' }] });
        expect(res).toMatchObject({ loading: false, focused: true, listOpen: true });
    });

    test('calls onError when loadOptions rejects', async () => {
        const onError = vi.fn();
        await loadAndConvert({
            loadOptions: async () => { throw new Error('boom'); },
            filterText: 'x', convertStringItemsToObjects, onError, onLoaded: vi.fn(),
        });
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'loadOptions' }));
    });
});
