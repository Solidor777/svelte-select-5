import { fireEvent, render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Select from '../../../src/lib/Select.svelte';

const items = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'cake', label: 'Cake' },
];
const tick = () => new Promise((r) => setTimeout(r, 0));

test('multiple + undefined value shows the placeholder (case 68)', () => {
    const { getByPlaceholderText } = render(Select, { props: { multiple: true, items, placeholder: 'Pick' } });
    expect(getByPlaceholderText('Pick')).toBeInTheDocument();
});

test('multiple: clicking an item adds it to value (case 69)', async () => {
    const { container, getByText } = render(Select, { props: { multiple: true, items, listOpen: true, focused: true } });
    await fireEvent.click(getByText('Pizza'));
    await tick();
    expect(container.querySelectorAll('.multi-item')).toHaveLength(1);
});

test('multiple: selected items do not appear in the list (case 70)', async () => {
    const { container, queryByText } = render(Select, {
        props: { multiple: true, items, value: [items[1]], listOpen: true, focused: true },
    });
    const listText = container.querySelector('.svelte-select-list').textContent;
    expect(listText).not.toContain('Pizza');
    expect(listText).toContain('Cake');
});

test('multiple: clicking the chip clear removes the item (case 72)', async () => {
    const { container } = render(Select, { props: { multiple: true, items, value: [items[0], items[1]] } });
    await fireEvent.pointerUp(container.querySelector('.multi-item-clear'));
    await tick();
    expect(container.querySelectorAll('.multi-item')).toHaveLength(1);
});

test('multiple: removing the last item shows placeholder and hides clear-all (case 73)', async () => {
    const { container } = render(Select, { props: { multiple: true, items, value: [items[0]] } });
    await fireEvent.pointerUp(container.querySelector('.multi-item-clear'));
    await tick();
    expect(container.querySelectorAll('.multi-item')).toHaveLength(0);
    expect(container.querySelector('.clear-select')).toBeNull();
});

test('multiple: clear-all wipes every selected item (case 74)', async () => {
    const { container } = render(Select, { props: { multiple: true, items, value: [items[0], items[1]] } });
    await fireEvent.click(container.querySelector('.clear-select'));
    await tick();
    expect(container.querySelectorAll('.multi-item')).toHaveLength(0);
});

test('multiple: disabled locks the chips (no clear buttons) (case 80)', () => {
    const { container } = render(Select, { props: { multiple: true, items, value: [items[0]], disabled: true } });
    expect(container.querySelector('.multi-item-clear')).toBeNull();
});

test('multiple: duplicate values are de-duplicated (case 102)', () => {
    const { container } = render(Select, { props: { multiple: true, items, value: [items[0], items[0]] } });
    expect(container.querySelectorAll('.multi-item')).toHaveLength(1);
});

test('multiple: placeholderAlwaysShow keeps the placeholder visible (case 134)', () => {
    const { getByPlaceholderText } = render(Select, {
        props: { multiple: true, items, value: [items[0]], placeholder: 'Pick', placeholderAlwaysShow: true },
    });
    expect(getByPlaceholderText('Pick')).toBeInTheDocument();
});

test('switching multiple modes transforms value correctly (case 131)', async () => {
    const { container, rerender } = render(Select, { props: { items, value: items[0] } });
    expect(container.querySelector('.selected-item')).not.toBeNull();
    await rerender({ multiple: true, items, value: items[0] });
    expect(container.querySelectorAll('.multi-item')).toHaveLength(1);
    // setupSingle clears value when leaving multiple mode
    await rerender({ multiple: false, items, value: items[0] });
    expect(container.querySelector('.multi-item')).toBeNull();
    expect(container.querySelector('.selected-item')).toBeNull();
});
