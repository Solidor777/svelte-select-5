import { fireEvent, render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Select from '../../../src/lib/Select.svelte';

const items = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'cake', label: 'Cake' },
];

test('filterText filters the list (case 39, 41)', async () => {
    const { container, getByText, queryByText } = render(Select, { props: { items, focused: true } });
    await fireEvent.input(container.querySelector('input'), { target: { value: 'piz' } });
    expect(container.querySelector('.svelte-select-list')).not.toBeNull();
    expect(getByText('Pizza')).toBeInTheDocument();
    expect(queryByText('Cake')).toBeNull();
});

test('custom itemFilter is honored (case 40)', async () => {
    const itemFilter = (label, filterText) => label.toLowerCase().startsWith(filterText.toLowerCase());
    const { container, queryByText } = render(Select, { props: { items, focused: true, itemFilter } });
    await fireEvent.input(container.querySelector('input'), { target: { value: 'c' } });
    expect(queryByText('Chocolate')).toBeInTheDocument();
    expect(queryByText('Cake')).toBeInTheDocument();
    expect(queryByText('Pizza')).toBeNull();
});

test('typing hides the selected item view (case 30)', async () => {
    const { container } = render(Select, { props: { items, value: items[0], focused: true } });
    await fireEvent.input(container.querySelector('input'), { target: { value: 'x' } });
    expect(container.querySelector('.selected-item.hide-selected-item')).not.toBeNull();
});

test('the first filtered item receives hover (case 42, 96)', async () => {
    const { container, getByText } = render(Select, { props: { items, focused: true } });
    await fireEvent.input(container.querySelector('input'), { target: { value: 'a' } });
    // first match (Chocolate or Cake contains 'a'? Chocolate has no 'a'; Cake/pizza? pizza no) -> Cake
    const firstItem = container.querySelector('.item');
    expect(firstItem).toHaveClass('hover');
    expect(getByText('Cake')).toBeInTheDocument();
});

test('closing the list clears filterText (case 32, 34)', async () => {
    const { container, component } = render(Select, { props: { items, focused: true, listOpen: true, filterText: 'pi' } });
    await fireEvent.keyDown(container.querySelector('input'), { key: 'Escape' });
    expect(container.querySelector('input').value).toBe('');
});

test('items updated after mount still filter (case 138)', async () => {
    const { container, getByText, rerender } = render(Select, { props: { items: [], focused: true, listOpen: true } });
    await rerender({ items, focused: true, listOpen: true, filterText: 'cake' });
    expect(getByText('Cake')).toBeInTheDocument();
});
