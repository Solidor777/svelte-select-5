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
