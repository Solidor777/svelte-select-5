import { fireEvent, render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import SingleSelection from '../../src/lib/SingleSelection.svelte';
import MultiSelection from '../../src/lib/MultiSelection.svelte';

test('SingleSelection shows the label', () => {
    const { getByText } = render(SingleSelection, { props: { value: { value: 1, label: 'One' } } });
    expect(getByText('One')).toBeInTheDocument();
});

test('MultiSelection renders a chip per value', () => {
    const { container } = render(MultiSelection, {
        props: { value: [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }] },
    });
    expect(container.querySelectorAll('.multi-item')).toHaveLength(2);
});

test('MultiSelection clears by index on chip clear pointerup', async () => {
    const onclear = vi.fn();
    const { container } = render(MultiSelection, {
        props: { value: [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }], onclear },
    });
    const clears = container.querySelectorAll('.multi-item-clear');
    await fireEvent.pointerUp(clears[1]);
    expect(onclear).toHaveBeenCalledWith(1);
});

test('MultiSelection hides clear when disabled', () => {
    const { container } = render(MultiSelection, {
        props: { value: [{ value: 1, label: 'One' }], disabled: true },
    });
    expect(container.querySelector('.multi-item-clear')).toBeNull();
});

test('MultiSelection full-item-clearable clears via chip click', async () => {
    const onclear = vi.fn();
    const { container } = render(MultiSelection, {
        props: { value: [{ value: 1, label: 'One' }], multiFullItemClearable: true, onclear },
    });
    await fireEvent.click(container.querySelector('.multi-item'));
    expect(onclear).toHaveBeenCalledWith(0);
});
