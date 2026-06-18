import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import ChevronIcon from '../../src/lib/ChevronIcon.svelte';

test('testing-library can render a component', () => {
    const { container } = render(ChevronIcon);
    expect(container.querySelector('svg')).toBeInTheDocument();
});
