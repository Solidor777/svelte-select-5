import { fireEvent, render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import Select from '../../../src/lib/Select.svelte';

const items = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'cake', label: 'Cake' },
    { value: 'chips', label: 'Chips' },
    { value: 'ice-cream', label: 'Ice Cream' },
];

const tick = () => new Promise((r) => setTimeout(r, 0));

test('selecting a value fires change and select (case 92, 162)', async () => {
    const onchange = vi.fn();
    const { container, getByText } = render(Select, { props: { items, onchange } });
    await fireEvent.pointerUp(container.querySelector('.svelte-select'));
    await fireEvent.click(getByText('Pizza'));
    await tick();
    expect(onchange).toHaveBeenCalledWith(items[1]);
});

test('clearing a single value fires clear with the removed value (case 93, 95)', async () => {
    const onclear = vi.fn();
    const { container } = render(Select, { props: { items, value: items[2], onclear } });
    await fireEvent.click(container.querySelector('.clear-select'));
    expect(onclear).toHaveBeenCalledWith(items[2]);
});

test('input does not fire when value[itemId] is unchanged (case 97)', async () => {
    const oninput = vi.fn();
    const { rerender } = render(Select, { props: { items, value: { value: 'cake', label: 'Cake' }, oninput } });
    oninput.mockClear();
    await rerender({ items, value: { value: 'cake', label: 'Cake' }, oninput });
    expect(oninput).not.toHaveBeenCalled();
});

test('multiple: input fires when an item is removed (case 98, 142)', async () => {
    const oninput = vi.fn();
    const { rerender } = render(Select, {
        props: { multiple: true, items, value: [items[1], items[3]], oninput },
    });
    oninput.mockClear();
    await rerender({ multiple: true, items, value: [items[1]], oninput });
    expect(oninput).toHaveBeenCalled();
});

test('focusing fires focus, blurring fires blur (case 159, 160)', async () => {
    const onfocus = vi.fn();
    const onblur = vi.fn();
    const { container } = render(Select, { props: { items, onfocus, onblur } });
    const input = container.querySelector('input');
    await fireEvent.focus(input);
    expect(onfocus).toHaveBeenCalled();
    await fireEvent.blur(input);
    expect(onblur).toHaveBeenCalled();
});

test('programmatic value change does not fire change (case 163)', async () => {
    const onchange = vi.fn();
    const { rerender } = render(Select, { props: { items, onchange } });
    await rerender({ items, value: items[0], onchange });
    await tick();
    expect(onchange).not.toHaveBeenCalled();
});

test('multiple: input fires on every removal including the last (case 142)', async () => {
    const oninput = vi.fn();
    const { container } = render(Select, {
        props: { multiple: true, items, value: [items[2], items[3]], oninput },
    });
    oninput.mockClear();
    await fireEvent.pointerUp(container.querySelector('.multi-item-clear'));
    await tick();
    await fireEvent.pointerUp(container.querySelector('.multi-item-clear'));
    await tick();
    expect(oninput).toHaveBeenCalledTimes(2);
    expect(container.querySelectorAll('.multi-item')).toHaveLength(0);
});

test('filtering fires onfilter while list open (case 176)', async () => {
    const onfilter = vi.fn();
    const { container } = render(Select, { props: { items, listOpen: true, onfilter } });
    onfilter.mockClear();
    await fireEvent.input(container.querySelector('input'), { target: { value: 'pi' } });
    expect(onfilter).toHaveBeenCalled();
});
