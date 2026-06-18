import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Select from '../../../src/lib/Select.svelte';

const items = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'cake', label: 'Cake' },
];
const grouped = [
    { value: 'chocolate', label: 'Chocolate', group: 'Sweet' },
    { value: 'cake', label: 'Cake', group: 'Sweet' },
    { value: 'pizza', label: 'Pizza', group: 'Savory' },
];

const hoveredText = (c) => c.querySelector('.item.hover')?.textContent.trim();

test('list opens with the first item hovered (case 17)', () => {
    const { container } = render(Select, { props: { items, listOpen: true, focused: true } });
    expect(hoveredText(container)).toBe('Chocolate');
});

test('a single-item list hovers that item (case 51)', () => {
    const { container } = render(Select, { props: { items: [items[1]], listOpen: true, focused: true } });
    expect(hoveredText(container)).toBe('Pizza');
});

test('opening with a single value hovers the value row (case 181)', () => {
    const { container } = render(Select, { props: { items, value: items[2], listOpen: true, focused: true } });
    expect(hoveredText(container)).toBe('Cake');
});

test('opening when multiple hovers index 0 (case 182)', () => {
    const { container } = render(Select, {
        props: { multiple: true, items, value: [items[1]], listOpen: true, focused: true },
    });
    // Pizza is selected (hidden from list in multiple mode); hover lands on the
    // first remaining item.
    const first = container.querySelector('.item');
    expect(first).toHaveClass('hover');
});

test('opening with a grouped value hovers the value row, not a header (case 183)', () => {
    const { container } = render(Select, {
        props: { items: grouped, groupBy: (i) => i.group, value: grouped[1], listOpen: true, focused: true },
    });
    const hovered = container.querySelector('.item.hover');
    expect(hovered.textContent.trim()).toBe('Cake');
    expect(hovered).not.toHaveClass('list-group-title');
});
