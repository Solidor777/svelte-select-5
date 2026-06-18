import { fireEvent, render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import Select from '../../src/lib/Select.svelte';

const items = [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }];

test('clicking the control opens the list', async () => {
    const { container, getByText } = render(Select, { props: { items } });
    await fireEvent.pointerUp(container.querySelector('.svelte-select'));
    expect(getByText('Apple')).toBeInTheDocument();
});

test('selecting an item fires onchange and onselect with the item', async () => {
    const onchange = vi.fn();
    const onselect = vi.fn();
    const { container, getByText } = render(Select, { props: { items, onchange, onselect } });
    await fireEvent.pointerUp(container.querySelector('.svelte-select'));
    await fireEvent.click(getByText('Banana'));
    // selection is dispatched on a microtask via setTimeout in itemSelected
    await new Promise((r) => setTimeout(r, 0));
    expect(onselect).toHaveBeenCalledWith(items[1]);
    expect(onchange).toHaveBeenCalledWith(items[1]);
});

test('clear button wipes the value and fires onclear', async () => {
    const onclear = vi.fn();
    const { container } = render(Select, { props: { items, value: items[0], onclear } });
    await fireEvent.click(container.querySelector('.clear-select'));
    expect(onclear).toHaveBeenCalled();
});

test('renders the selected value', () => {
    const { getByText } = render(Select, { props: { items, value: items[0] } });
    expect(getByText('Apple')).toBeInTheDocument();
});

test('multiple renders a chip per selected value', () => {
    const { container } = render(Select, { props: { items, multiple: true, value: [items[0], items[1]] } });
    expect(container.querySelectorAll('.multi-item')).toHaveLength(2);
});
