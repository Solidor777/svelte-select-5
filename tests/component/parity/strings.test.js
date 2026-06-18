import { fireEvent, render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Select from '../../../src/lib/Select.svelte';

test('array of string items renders the list (case 100)', async () => {
    const { container, getByText } = render(Select, { props: { items: ['one', 'two', 'three'] } });
    await fireEvent.pointerUp(container.querySelector('.svelte-select'));
    expect(getByText('one')).toBeInTheDocument();
    expect(getByText('three')).toBeInTheDocument();
});

test('string value renders (case 101, 108)', () => {
    const { getByText } = render(Select, { props: { items: ['one', 'two'], value: 'two' } });
    expect(getByText('two')).toBeInTheDocument();
});

test('multiple string values render as chips (case 109)', () => {
    const { container } = render(Select, { props: { multiple: true, items: ['one', 'two'], value: ['one', 'two'] } });
    expect(container.querySelectorAll('.multi-item')).toHaveLength(2);
});
