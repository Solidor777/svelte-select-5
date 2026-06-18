import { fireEvent, render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import SnippetsList from './fixtures/SnippetsList.svelte';
import SnippetsValue from './fixtures/SnippetsValue.svelte';
import SnippetsOverride from './fixtures/SnippetsOverride.svelte';

const items = [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }];

test('item snippet overrides item content (case 169)', () => {
    const { container } = render(SnippetsList, { props: { items } });
    const custom = [...container.querySelectorAll('.snip-item')].map((n) => n.textContent);
    expect(custom).toEqual(['I:Apple', 'I:Banana']);
});

test('prepend snippet renders (case 114)', () => {
    const { getByText } = render(SnippetsList, { props: { items } });
    expect(getByText('PRE')).toBeInTheDocument();
});

test('empty snippet renders when no items (case 91 override)', () => {
    const { getByText } = render(SnippetsList, { props: { items: [] } });
    expect(getByText('NOTHING HERE')).toBeInTheDocument();
});

test('list-prepend and list-append snippets render (case 170)', () => {
    const { getByText } = render(SnippetsList, { props: { items } });
    expect(getByText('LP')).toBeInTheDocument();
    expect(getByText('LA')).toBeInTheDocument();
});

test('chevron-icon snippet renders (case 166)', () => {
    const { getByText } = render(SnippetsList, { props: { items, showChevron: true } });
    expect(getByText('CHV')).toBeInTheDocument();
});

test('selection snippet renders the single value (case 89)', () => {
    const { getByText } = render(SnippetsValue, { props: { items, value: items[0] } });
    expect(getByText('S:Apple')).toBeInTheDocument();
});

test('selection snippet renders for each multiple value (case 90)', () => {
    const { container } = render(SnippetsValue, { props: { items, multiple: true, value: [items[0], items[1]] } });
    const sel = [...container.querySelectorAll('.snip-selection')].map((n) => n.textContent);
    expect(sel).toEqual(['S:Apple', 'S:Banana']);
});

test('clear-icon snippet replaces the clear icon (case 128)', () => {
    const { getByText } = render(SnippetsValue, { props: { items, value: items[0] } });
    expect(getByText('CLR')).toBeInTheDocument();
});

test('list snippet overrides the whole list (case 167)', () => {
    const { getByText } = render(SnippetsOverride, { props: { items } });
    expect(getByText('custom list with 2 items')).toBeInTheDocument();
});

test('input-hidden snippet overrides the hidden input (case 168)', () => {
    const { container } = render(SnippetsOverride, { props: { items } });
    expect(container.querySelector('input.snip-hidden')).not.toBeNull();
});
