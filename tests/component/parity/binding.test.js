import { fireEvent, render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import ParentBinding from './fixtures/ParentBinding.svelte';

const items = [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }];
const tick = () => new Promise((r) => setTimeout(r, 0));

test('bind:value flows the selection up to the parent (case 48)', async () => {
    const { container, getByText } = render(ParentBinding, { props: { items } });
    expect(container.querySelector('.result').textContent).toBe('none');
    await fireEvent.click(getByText('Banana'));
    await tick();
    expect(container.querySelector('.result').textContent).toBe('Banana');
});
