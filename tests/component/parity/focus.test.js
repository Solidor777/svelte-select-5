import { fireEvent, render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Select from '../../../src/lib/Select.svelte';

const items = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'pizza', label: 'Pizza' },
];

test('focusing the input sets the focused class (case 1, 26)', async () => {
    const { container } = render(Select, { props: { items } });
    await fireEvent.focus(container.querySelector('input'));
    expect(container.querySelector('.svelte-select')).toHaveClass('focused');
});

test('blur closes the list and removes focus (case 21, 99, 129)', async () => {
    const { container } = render(Select, { props: { items, listOpen: true, focused: true } });
    await fireEvent.blur(container.querySelector('input'));
    expect(container.querySelector('.svelte-select-list')).toBeNull();
    expect(container.querySelector('.svelte-select')).not.toHaveClass('focused');
});

test('blur clears filterText by default (case 23)', async () => {
    const { container } = render(Select, { props: { items, focused: true, listOpen: true, filterText: 'piz' } });
    await fireEvent.blur(container.querySelector('input'));
    expect(container.querySelector('input').value).toBe('');
});

test('blur preserves filterText when clearFilterTextOnBlur is false (case 22)', async () => {
    const { container } = render(Select, {
        props: { items, focused: true, listOpen: true, filterText: 'piz', clearFilterTextOnBlur: false },
    });
    await fireEvent.blur(container.querySelector('input'));
    expect(container.querySelector('input').value).toBe('piz');
});
