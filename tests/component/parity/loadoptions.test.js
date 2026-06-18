import { fireEvent, render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import Select from '../../../src/lib/Select.svelte';

const loaded = [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }];
const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));
// Run the debounced load immediately so tests don't wait on the 300ms default.
const debounce = (fn) => fn();

test('loadOptions populates the list on resolve and fires onloaded (case 84, 120)', async () => {
    const onloaded = vi.fn();
    const loadOptions = async () => loaded;
    const { container, findByText } = render(Select, {
        props: { loadOptions, debounce, listOpen: true, focused: true, onloaded },
    });
    await fireEvent.input(container.querySelector('input'), { target: { value: 'a' } });
    expect(await findByText('Apple')).toBeInTheDocument();
    expect(onloaded).toHaveBeenCalledWith({ items: loaded });
});

test('loadOptions rejection fires onerror with type loadOptions (case 121)', async () => {
    const onerror = vi.fn();
    const loadOptions = async () => { throw 'error 123'; };
    const { container } = render(Select, { props: { loadOptions, debounce, listOpen: true, focused: true, onerror } });
    await fireEvent.input(container.querySelector('input'), { target: { value: 'a' } });
    await tick();
    expect(onerror).toHaveBeenCalledWith({ type: 'loadOptions', details: 'error 123' });
});

test('cancelled response is handled without error (case 127)', async () => {
    // The cancelled branch returns undefined from loadAndConvert; the component must
    // handle it without throwing (the legacy case asserts nothing beyond no-crash).
    const loadOptions = async () => ({ cancelled: true });
    const { container } = render(Select, { props: { loadOptions, debounce, focused: true } });
    await fireEvent.input(container.querySelector('input'), { target: { value: 'x' } });
    await tick();
    expect(container.querySelector('.svelte-select')).not.toBeNull();
});

test('items + loadOptions starts with the list closed (case 118)', () => {
    const { container } = render(Select, { props: { items: loaded, loadOptions: async () => loaded } });
    expect(container.querySelector('.svelte-select-list')).toBeNull();
});

test('loadOptions + initial value renders the value (case 189)', () => {
    const { getByText } = render(Select, { props: { loadOptions: async () => loaded, value: { value: 'a', label: 'Apple' } } });
    expect(getByText('Apple')).toBeInTheDocument();
});

test('loadOptions + items closes the list on blur (case 126)', async () => {
    const { container } = render(Select, {
        props: { items: loaded, loadOptions: async () => loaded, listOpen: true, focused: true },
    });
    await fireEvent.blur(container.querySelector('input'));
    expect(container.querySelector('.svelte-select-list')).toBeNull();
});

test('loadOptions populates the open list on resolve (case 135)', async () => {
    const { container, findByText } = render(Select, {
        props: { loadOptions: async () => loaded, value: { value: 'a', label: 'Apple' }, debounce, listOpen: true, focused: true },
    });
    await fireEvent.input(container.querySelector('input'), { target: { value: 'ban' } });
    expect(await findByText('Banana')).toBeInTheDocument();
});

test('loadOptions + multiple + value keeps filterText after resolve (case 136)', async () => {
    const { container } = render(Select, {
        props: {
            multiple: true,
            value: { value: 'x', label: 'X' },
            listOpen: true,
            filterText: 'test',
            loadOptions: async () => loaded,
            debounce,
            focused: true,
        },
    });
    await tick();
    expect(container.querySelector('input').value).toBe('test');
});

test('loadOptions + groupBy shows group headers (case 161)', async () => {
    const groupedLoaded = [
        { value: 'a', label: 'Apple', group: 'Sweet' },
        { value: 'p', label: 'Potato', group: 'Savory' },
    ];
    const { container, findByText } = render(Select, {
        props: { loadOptions: async () => groupedLoaded, groupBy: (i) => i.group, debounce, listOpen: true, focused: true },
    });
    await fireEvent.input(container.querySelector('input'), { target: { value: 'potato' } });
    await findByText('Potato');
    const titles = [...container.querySelectorAll('.list-group-title')].map((n) => n.textContent.trim());
    expect(titles).toContain('Savory');
});

test('loadOptions + groupBy does not duplicate group titles across filters (case 188)', async () => {
    const groupedLoaded = [
        { value: 'a', label: 'Apple', group: 'Sweet' },
        { value: 'c', label: 'Cream', group: 'Sweet' },
    ];
    const loadOptions = async () => groupedLoaded;
    const { container } = render(Select, {
        props: { loadOptions, groupBy: (i) => i.group, debounce, listOpen: true, focused: true },
    });
    await fireEvent.input(container.querySelector('input'), { target: { value: 'cre' } });
    await tick();
    expect(container.querySelectorAll('.list-group-title')).toHaveLength(1);
    await fireEvent.input(container.querySelector('input'), { target: { value: 'cr' } });
    await tick();
    expect(container.querySelectorAll('.list-group-title')).toHaveLength(1);
});
