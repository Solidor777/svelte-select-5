import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Item from '../../src/lib/Item.svelte';

test('renders the label by default', () => {
    const { getByText } = render(Item, { props: { item: { value: 1, label: 'Apple' }, index: 0 } });
    expect(getByText('Apple')).toBeInTheDocument();
});

test('applies active and hover classes', () => {
    const { container } = render(Item, {
        props: { item: { value: 1, label: 'A' }, index: 0, isActive: true, isHover: true },
    });
    const el = container.querySelector('.item');
    expect(el).toHaveClass('active');
    expect(el).toHaveClass('hover');
});

test('applies group-header and not-selectable classes', () => {
    const { container } = render(Item, {
        props: { item: { value: 1, label: 'G' }, index: 0, isGroupHeader: true, isSelectable: false },
    });
    const el = container.querySelector('.item');
    expect(el).toHaveClass('list-group-title');
    expect(el).toHaveClass('not-selectable');
});
