import { fireEvent, render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import Select from '../../../src/lib/Select.svelte';

const items = [
    { value: 'chocolate', label: 'Chocolate', group: 'Sweet' },
    { value: 'cake', label: 'Cake', group: 'Sweet' },
    { value: 'pizza', label: 'Pizza', group: 'Savory' },
    { value: 'chips', label: 'Chips', group: 'Savory' },
];
const groupBy = (item) => item.group;
const tick = () => new Promise((r) => setTimeout(r, 0));

test('items are grouped with headers (case 59)', () => {
    const { container } = render(Select, { props: { items, groupBy, listOpen: true, focused: true } });
    const titles = [...container.querySelectorAll('.list-group-title')].map((n) => n.textContent.trim());
    expect(titles).toEqual(['Sweet', 'Savory']);
});

test('clicking a group header does not select (case 60)', async () => {
    const onselect = vi.fn();
    const { container, getByText } = render(Select, { props: { items, groupBy, listOpen: true, focused: true, onselect } });
    await fireEvent.click(getByText('Sweet'));
    await tick();
    expect(onselect).not.toHaveBeenCalled();
});

test('groupHeaderSelectable: clicking the header selects it (case 65)', async () => {
    const onselect = vi.fn();
    const { getByText } = render(Select, {
        props: { items, groupBy, groupHeaderSelectable: true, listOpen: true, focused: true, onselect },
    });
    await fireEvent.click(getByText('Sweet'));
    await tick();
    expect(onselect).toHaveBeenCalled();
});

test('item with selectable:false is not selected on click (case 61)', async () => {
    const onselect = vi.fn();
    const guarded = [{ value: 'x', label: 'X', selectable: false }];
    const { getByText } = render(Select, { props: { items: guarded, listOpen: true, focused: true, onselect } });
    await fireEvent.click(getByText('X'));
    await tick();
    expect(onselect).not.toHaveBeenCalled();
});

test('groupFilter can reorder groups (case 66)', () => {
    const groupFilter = (groups) => groups.slice().reverse();
    const { container } = render(Select, { props: { items, groupBy, groupFilter, listOpen: true, focused: true } });
    const titles = [...container.querySelectorAll('.list-group-title')].map((n) => n.textContent.trim());
    expect(titles).toEqual(['Savory', 'Sweet']);
});

test('grouped items updated after mount still render grouped (case 139)', async () => {
    const { container, rerender } = render(Select, { props: { items: [], groupBy, listOpen: true, focused: true } });
    await rerender({ items, groupBy, listOpen: true, focused: true });
    expect(container.querySelectorAll('.list-group-title').length).toBe(2);
});

test('grouped list with no filter matches shows the empty message (case 165)', async () => {
    const { container, getByText } = render(Select, { props: { items, groupBy, listOpen: true, focused: true } });
    await fireEvent.input(container.querySelector('input'), { target: { value: 'zzzzz' } });
    expect(getByText('No options')).toBeInTheDocument();
});

test('groupHeaderSelectable false: headers never get active/hover classes (case 174a)', () => {
    const { container } = render(Select, { props: { items, groupBy, listOpen: true, focused: true } });
    for (const title of container.querySelectorAll('.list-group-title')) {
        expect(title).not.toHaveClass('active');
        expect(title).not.toHaveClass('hover');
    }
});

test('keyboard navigation skips group headers (case 174)', async () => {
    const { container } = render(Select, { props: { items, groupBy, listOpen: true, focused: true } });
    const input = container.querySelector('input');
    for (let n = 0; n < 5; n++) {
        await fireEvent.keyDown(input, { key: 'ArrowDown' });
        const hovered = container.querySelector('.item.hover');
        expect(hovered).not.toHaveClass('list-group-title');
    }
});

test('groupBy with a selected value still filters (case 140)', async () => {
    const { container, getByText, queryByText } = render(Select, {
        props: { items, groupBy, value: items[0], listOpen: true, focused: true },
    });
    await fireEvent.input(container.querySelector('input'), { target: { value: 'pizza' } });
    expect(getByText('Pizza')).toBeInTheDocument();
    expect(queryByText('Cake')).toBeNull();
});

test('groupBy with custom itemId and label renders grouped (case 184)', () => {
    const custom = [
        { id: 1, name: 'Alpha', cat: 'A' },
        { id: 2, name: 'Beta', cat: 'B' },
    ];
    const { getByText, container } = render(Select, {
        props: { items: custom, itemId: 'id', label: 'name', groupBy: (i) => i.cat, listOpen: true, focused: true },
    });
    expect(getByText('Alpha')).toBeInTheDocument();
    expect(getByText('Beta')).toBeInTheDocument();
    expect(container.querySelectorAll('.list-group-title')).toHaveLength(2);
});
