import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Select from '../../../src/lib/Select.svelte';

const items = [
    { value: 'cake', label: 'Cake' },
    { value: 'pizza', label: 'Pizza' },
];

const hidden = (c) => c.querySelector('input[type="hidden"]');

test('name prop is placed on the hidden input (case 143)', () => {
    const { container } = render(Select, { props: { name: 'Foods', items } });
    expect(hidden(container).name).toBe('Foods');
});

test('no value -> hidden input has no value (case 144)', () => {
    const { container } = render(Select, { props: { name: 'Foods', items } });
    expect(hidden(container).value).toBeFalsy();
});

test('single value -> hidden input holds the JSON value (case 145)', () => {
    const { container } = render(Select, { props: { items, value: items[0] } });
    expect(JSON.parse(hidden(container).value).value).toBe('cake');
});

test('multiple no value -> hidden input has no value (case 146)', () => {
    const { container } = render(Select, { props: { multiple: true, items } });
    expect(hidden(container).value).toBeFalsy();
});

test('multiple value -> hidden input lists the value items (case 147)', () => {
    const { container } = render(Select, { props: { multiple: true, items, value: [items[0], items[1]] } });
    const parsed = JSON.parse(hidden(container).value);
    expect(parsed[0].value).toBe('cake');
    expect(parsed[1].value).toBe('pizza');
});
