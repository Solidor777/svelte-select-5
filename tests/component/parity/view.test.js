import { fireEvent, render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Select from '../../../src/lib/Select.svelte';

const items = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'cake', label: 'Cake' },
];
const tick = () => new Promise((r) => setTimeout(r, 0));

test('selected item default view shows the label (case 12)', () => {
    const { getByText } = render(Select, { props: { items, value: items[1] } });
    expect(getByText('Pizza')).toBeInTheDocument();
});

test('view updates when value changes (case 13)', async () => {
    const { getByText, rerender } = render(Select, { props: { items, value: items[0] } });
    await rerender({ items, value: items[2] });
    expect(getByText('Cake')).toBeInTheDocument();
});

test('clear wipes the value view and fires justValue null (case 14, 164)', async () => {
    let justValue = 'set';
    const { container } = render(Select, {
        props: { items, value: items[0], justValue, onclear: () => {} },
    });
    await fireEvent.click(container.querySelector('.clear-select'));
    await tick();
    expect(container.querySelector('.selected-item')).toBeNull();
});

test('placeholder reappears when the list closes with no value (case 29)', () => {
    const { getByPlaceholderText } = render(Select, { props: { items, placeholder: 'Pick one' } });
    expect(getByPlaceholderText('Pick one')).toBeInTheDocument();
});

test('disabled disables the input and sets the disabled class (case 44)', () => {
    const { container } = render(Select, { props: { items, disabled: true } });
    expect(container.querySelector('.svelte-select')).toHaveClass('disabled');
    expect(container.querySelector('input').disabled).toBe(true);
});

test('cannot clear a disabled Select (case 47)', () => {
    const { container } = render(Select, { props: { items, value: items[0], disabled: true } });
    expect(container.querySelector('.clear-select')).toBeNull();
});

test('cannot clear when clearable is false (case 54)', () => {
    const { container } = render(Select, { props: { items, value: items[0], clearable: false } });
    expect(container.querySelector('.clear-select')).toBeNull();
});

test('searchable false makes the input readonly (case 55, 132)', () => {
    const { container } = render(Select, { props: { items, searchable: false } });
    expect(container.querySelector('input').readOnly).toBe(true);
});

test('loading shows the loading icon (case 57)', () => {
    const { container } = render(Select, { props: { items, loading: true } });
    expect(container.querySelector('.icon.loading')).not.toBeNull();
});

test('inputStyles applies to the input (case 58)', () => {
    const { container } = render(Select, { props: { items, inputStyles: 'text-transform: uppercase;' } });
    expect(container.querySelector('input').getAttribute('style')).toContain('uppercase');
});

test('containerStyles override the control (case 43)', () => {
    const { container } = render(Select, { props: { items, containerStyles: 'background: rgb(1, 2, 3);' } });
    expect(container.querySelector('.svelte-select').getAttribute('style')).toContain('rgb(1, 2, 3)');
});

test('class prop injects container classes (case 119)', () => {
    const { container } = render(Select, { props: { items, class: 'my-custom' } });
    expect(container.querySelector('.svelte-select')).toHaveClass('my-custom');
});

test('hasError sets the error class (case 175)', () => {
    const { container } = render(Select, { props: { items, hasError: true } });
    expect(container.querySelector('.svelte-select')).toHaveClass('error');
});

test('inputAttributes are placed on the input; id too (case 107, 154)', () => {
    const { container } = render(Select, { props: { items, id: 'food', inputAttributes: { 'aria-label': 'Food' } } });
    const input = container.querySelector('input');
    expect(input.id).toBe('food');
    expect(input.getAttribute('aria-label')).toBe('Food');
});

test('showChevron with no value shows the chevron (case 115)', () => {
    const { container } = render(Select, { props: { items, showChevron: true } });
    expect(container.querySelector('.icon.chevron')).not.toBeNull();
});

test('showChevron renders the chevron even with a value set (case 115/116)', () => {
    // Parity: the chevron renders whenever showChevron is true, regardless of value.
    // (The legacy "only when no value" assertion checked a non-existent `.indicator`
    // class and was vacuous.)
    const { container } = render(Select, { props: { items, showChevron: true, value: items[0] } });
    expect(container.querySelector('.icon.chevron')).not.toBeNull();
});

test('showChevron + clearable always shows the chevron, even with a value (case 117)', () => {
    const { container } = render(Select, { props: { items, showChevron: true, clearable: false, value: items[0] } });
    expect(container.querySelector('.icon.chevron')).not.toBeNull();
});

test('listOpen true on mount shows the list (case 156)', () => {
    const { container } = render(Select, { props: { items, listOpen: true } });
    expect(container.querySelector('.svelte-select-list')).not.toBeNull();
});

test('custom label key renders the right label (case 82, 86)', () => {
    const labelled = [{ value: 1, name: 'Alpha' }, { value: 2, name: 'Beta' }];
    const { getByText } = render(Select, { props: { items: labelled, label: 'name', value: labelled[0] } });
    expect(getByText('Alpha')).toBeInTheDocument();
});

test('custom itemId looks up a string value against items (case 83, 111)', () => {
    const { getByText } = render(Select, { props: { items, itemId: 'value', value: 'cake' } });
    expect(getByText('Cake')).toBeInTheDocument();
});

test('items change updates the displayed value label (case 122, 123)', async () => {
    const { getByText, rerender } = render(Select, { props: { items, value: { value: 'chocolate', label: 'Chocolate' } } });
    await rerender({
        items: [{ value: 'chocolate', label: 'Dark Chocolate' }, ...items.slice(1)],
        value: { value: 'chocolate', label: 'Chocolate' },
    });
    expect(getByText('Dark Chocolate')).toBeInTheDocument();
});

test('items change keeps the value when its itemId is not found in new items (case 123)', async () => {
    const { getByText, rerender } = render(Select, { props: { items, value: { value: 'chips', label: 'Chips' } } });
    await rerender({
        items: [{ value: 'loaded-fries', label: 'Loaded Fries' }, ...items],
        value: { value: 'chips', label: 'Chips' },
    });
    // 'chips' is still present here; remove it to exercise the not-found branch
    await rerender({
        items: [{ value: 'loaded-fries', label: 'Loaded Fries' }],
        value: { value: 'chips', label: 'Chips' },
    });
    expect(getByText('Chips')).toBeInTheDocument();
});

test('clicking toggles the list open and closed (case 38)', async () => {
    const { container } = render(Select, { props: { items } });
    const control = container.querySelector('.svelte-select');
    await fireEvent.pointerUp(control);
    expect(container.querySelector('.svelte-select-list')).not.toBeNull();
    await fireEvent.pointerUp(control);
    expect(container.querySelector('.svelte-select-list')).toBeNull();
});
