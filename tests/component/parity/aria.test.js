import { fireEvent, render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Select from '../../../src/lib/Select.svelte';

const items = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'cake', label: 'Cake' },
    { value: 'chips', label: 'Chips' },
    { value: 'ice-cream', label: 'Ice Cream' },
];

test('aria-context describes the highlighted item, updating on nav (case 148)', async () => {
    const { container } = render(Select, { props: { items, listOpen: true, focused: true } });
    const aria = container.querySelector('#aria-context');
    expect(aria.innerHTML).toContain('Chocolate');
    await fireEvent.keyDown(container.querySelector('input'), { key: 'ArrowDown' });
    expect(aria.innerHTML).toContain('Pizza');
});

test('aria-selection describes the single value (case 149)', () => {
    const { container } = render(Select, { props: { items, value: { value: 'cake', label: 'Cake' }, focused: true } });
    expect(container.querySelector('#aria-selection').innerHTML).toContain('Cake');
});

test('aria-selection describes multiple values (case 150)', () => {
    const { container } = render(Select, {
        props: { multiple: true, items, value: [items[2], items[1]], focused: true },
    });
    const aria = container.querySelector('#aria-selection').innerHTML;
    expect(aria).toContain('Cake');
    expect(aria).toContain('Pizza');
});

test('custom ariaValues is used for aria-selection (case 151)', () => {
    const { container } = render(Select, {
        props: { items, value: { value: 'pizza', label: 'Pizza' }, focused: true, ariaValues: (val) => `Yummy ${val} in my tummy!` },
    });
    expect(container.querySelector('#aria-selection').innerHTML).toBe('Yummy Pizza in my tummy!');
});

test('custom ariaListOpen is used for aria-context (case 152)', () => {
    const { container } = render(Select, {
        props: { items, listOpen: true, focused: true, ariaListOpen: (label, count) => `label: ${label}, count: ${count}` },
    });
    expect(container.querySelector('#aria-context').innerHTML).toBe('label: Chocolate, count: 5');
});

test('custom ariaFocused is used for aria-context when focused and closed (case 153)', () => {
    const { container } = render(Select, {
        props: { items, focused: true, listOpen: false, ariaFocused: () => `nothing to see here.` },
    });
    expect(container.querySelector('#aria-context').innerHTML).toBe('nothing to see here.');
});
