import { fireEvent, render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import Select from '../../../src/lib/Select.svelte';

const items = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'cake', label: 'Cake' },
];
const tick = () => new Promise((r) => setTimeout(r, 0));
const key = (c, k) => fireEvent.keyDown(c.querySelector('input'), { key: k });

test('ArrowDown/ArrowUp move the hovered item (case 8)', async () => {
    const onhoveritem = vi.fn();
    const { container } = render(Select, { props: { items, listOpen: true, focused: true, onhoveritem } });
    onhoveritem.mockClear();
    await key(container, 'ArrowDown');
    expect(onhoveritem).toHaveBeenLastCalledWith(1);
    await key(container, 'ArrowUp');
    expect(onhoveritem).toHaveBeenLastCalledWith(0);
});

test('Enter selects the hovered item (case 9)', async () => {
    const onselect = vi.fn();
    const { container } = render(Select, { props: { items, listOpen: true, focused: true, onselect } });
    await key(container, 'ArrowDown');
    await key(container, 'Enter');
    await tick();
    expect(onselect).toHaveBeenCalledWith(items[1]);
});

test('Tab selects the hovered item and closes (case 10)', async () => {
    const onselect = vi.fn();
    const { container } = render(Select, { props: { items, listOpen: true, focused: true, onselect } });
    await key(container, 'Tab');
    await tick();
    expect(onselect).toHaveBeenCalledWith(items[0]);
    expect(container.querySelector('.svelte-select-list')).toBeNull();
});

test('Enter on the already-selected active item does not re-select, just closes (case 11, 113)', async () => {
    const onselect = vi.fn();
    const { container } = render(Select, { props: { items, value: items[0], listOpen: true, focused: true, onselect } });
    await key(container, 'Enter');
    await tick();
    expect(onselect).not.toHaveBeenCalled();
    expect(container.querySelector('.svelte-select-list')).toBeNull();
});

test('ArrowDown opens the list when closed (case 27)', async () => {
    const { container } = render(Select, { props: { items, focused: true } });
    expect(container.querySelector('.svelte-select-list')).toBeNull();
    await key(container, 'ArrowDown');
    expect(container.querySelector('.svelte-select-list')).not.toBeNull();
});

test('Escape closes the list (case 133)', async () => {
    const { container } = render(Select, { props: { items, listOpen: true, focused: true } });
    await key(container, 'Escape');
    expect(container.querySelector('.svelte-select-list')).toBeNull();
});

test('selecting an item closes the list (case 45)', async () => {
    const { container, getByText } = render(Select, { props: { items, listOpen: true, focused: true } });
    await fireEvent.click(getByText('Pizza'));
    await tick();
    expect(container.querySelector('.svelte-select-list')).toBeNull();
});

test('closeListOnChange false keeps the list open after select (case 186)', async () => {
    const { container, getByText } = render(Select, {
        props: { items, listOpen: true, focused: true, closeListOnChange: false },
    });
    await fireEvent.click(getByText('Pizza'));
    await tick();
    expect(container.querySelector('.svelte-select-list')).not.toBeNull();
});

test('multiple: ArrowLeft then ArrowRight move activeValue across chips (case 77, 78)', async () => {
    const { container } = render(Select, {
        props: { multiple: true, items, value: [items[0], items[1]], focused: true },
    });
    await key(container, 'ArrowLeft');
    expect(container.querySelectorAll('.multi-item.active')).toHaveLength(1);
    await key(container, 'ArrowRight');
    expect(container.querySelectorAll('.multi-item.active')).toHaveLength(0);
});

test('multiple: Enter selects the highlighted item when filtering (case 103)', async () => {
    const onselect = vi.fn();
    const { container } = render(Select, {
        props: { multiple: true, items, filterText: 'pizza', listOpen: true, focused: true, onselect },
    });
    await key(container, 'Enter');
    await tick();
    expect(onselect).toHaveBeenCalledWith(expect.objectContaining({ value: 'pizza' }));
});

test('multiple: Backspace with no value does nothing (case 105)', async () => {
    const onclear = vi.fn();
    const { container } = render(Select, { props: { multiple: true, items, focused: true, onclear } });
    await key(container, 'Backspace');
    expect(onclear).not.toHaveBeenCalled();
});

test('Tab/Enter on a selectable:false hovered item does not select (case 177, 178)', async () => {
    const onselect = vi.fn();
    const guarded = [{ value: 'x', label: 'X', selectable: false }];
    const { container } = render(Select, { props: { items: guarded, listOpen: true, focused: true, onselect } });
    await key(container, 'Enter');
    await tick();
    expect(onselect).not.toHaveBeenCalled();
});
