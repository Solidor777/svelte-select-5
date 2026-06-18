import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import ChevronIcon from '../../src/lib/ChevronIcon.svelte';
import ClearIcon from '../../src/lib/ClearIcon.svelte';
import LoadingIcon from '../../src/lib/LoadingIcon.svelte';

test.each([
    ['ChevronIcon', ChevronIcon],
    ['ClearIcon', ClearIcon],
    ['LoadingIcon', LoadingIcon],
])('%s renders an svg', (_name, Icon) => {
    const { container } = render(Icon);
    expect(container.querySelector('svg')).toBeInTheDocument();
});
