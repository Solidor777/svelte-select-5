import { render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import Select from '../../src/lib/Select.svelte';

const items = [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }];

// Parity invariant: a preset value fires `input` exactly once on mount. prev_value
// is undefined on the first reactive pass, so the first dispatchSelectedItem sees no
// previous value and dispatches. Seeding prev_value at declaration would suppress
// this and break parity — keep the snapshot in the trailing effect only.
test('oninput fires exactly once on mount with a preset single value', () => {
    const oninput = vi.fn();
    render(Select, { props: { items, value: items[0], oninput } });
    expect(oninput).toHaveBeenCalledTimes(1);
});

test('oninput fires exactly once on mount with a preset multiple value', () => {
    const oninput = vi.fn();
    render(Select, { props: { items, multiple: true, value: [items[0]], oninput } });
    expect(oninput).toHaveBeenCalledTimes(1);
});

test('oninput does not fire on mount when no value is preset', () => {
    const oninput = vi.fn();
    render(Select, { props: { items, oninput } });
    expect(oninput).not.toHaveBeenCalled();
});
