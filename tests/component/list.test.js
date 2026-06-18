import { fireEvent, render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import List from '../../src/lib/List.svelte';

const items = [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }];

test('renders one row per filtered item', () => {
    const { getByText } = render(List, { props: { filteredItems: items } });
    expect(getByText('One')).toBeInTheDocument();
    expect(getByText('Two')).toBeInTheDocument();
});

test('clicking an item fires onselect with that item and index', async () => {
    const onselect = vi.fn();
    const { getByText } = render(List, { props: { filteredItems: items, onselect } });
    await fireEvent.click(getByText('Two'));
    expect(onselect).toHaveBeenCalledWith(items[1], 1);
});

test('hovering an item fires onhover with its index', async () => {
    const onhover = vi.fn();
    const { getByText } = render(List, { props: { filteredItems: items, onhover } });
    await fireEvent.mouseOver(getByText('Two'));
    expect(onhover).toHaveBeenCalledWith(1);
});

test('shows default empty state when no items', () => {
    const { getByText } = render(List, { props: { filteredItems: [] } });
    expect(getByText('No options')).toBeInTheDocument();
});

test('hides empty state when hideEmptyState is true', () => {
    const { queryByText } = render(List, { props: { filteredItems: [], hideEmptyState: true } });
    expect(queryByText('No options')).toBeNull();
});

test('marks the active item (single select)', () => {
    const { getByText } = render(List, { props: { filteredItems: items, value: items[0], itemId: 'value' } });
    expect(getByText('One').closest('.item')).toHaveClass('active');
});
