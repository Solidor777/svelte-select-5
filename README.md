<div align="center">
  <img src="https://raw.githubusercontent.com/rob-balfre/svelte-select/master/svelte-select.png" alt="Svelte Select" width="150" />
  <h1>Svelte Select</h1>
</div>

<div align="center">
  <a href="https://npmjs.org/package/svelte-select-runes">
    <img src="https://badgen.now.sh/npm/v/svelte-select-runes" alt="version" />
  </a>
  <a href="https://npmjs.org/package/svelte-select-runes">
    <img src="https://badgen.now.sh/npm/dm/svelte-select-runes" alt="downloads" />
  </a>
</div>
<div align="center">A select/autocomplete/typeahead Svelte component.</div>

## Demos

Run the example site locally with `npm run dev` — every prop, event, snippet and
more lives under `src/routes/examples`, including a [Simple](src/routes/examples/advanced/simple/+page.svelte)
and a [Show everything](src/routes/examples/advanced/show-everything/+page.svelte) example.

## Installation

```bash
npm install svelte-select-runes
```

## Svelte 5
v6 is a Svelte 5 runes rewrite and **requires Svelte 5**. Events are now callback
props (`onchange`, `onselect`, …) and slots are now snippets. Theming uses a
layered `--svelte-select-*` token system (old flat variables still work but are
deprecated). See the [migration guide](/MIGRATION_GUIDE.md). For Svelte 3/4, use
svelte-select v5.


## Upgrading Svelte Select
See [migration guide](/MIGRATION_GUIDE.md) if upgrading


## Rollup and low/no-build setups

List position and floating is powered by `floating-ui`, see their [package-entry-points](https://github.com/floating-ui/floating-ui#package-entry-points) docs if you encounter build errors.



## Props

| Prop                   | Type      | Default         | Description                                                    |
| ---------------------- | --------- | --------------- | -------------------------------------------------------------- |
| items                  | `any[]`   | `[]`            | Array of items available to display / filter                   |
| value                  | `any`     | `null`          | Selected value(s)                                              |
| justValue              | `any`     | `null`          | **READ-ONLY** Selected value(s) excluding container object     |
| itemId                 | `string`  | `value`         | Override default identifier                                    |
| label                  | `string`  | `label`         | Override default label                                         |
| id                     | `string`  | `null`          | id attr for input field                                        |
| filterText             | `string`  | `''`            | Text to filter `items` by                                      |
| placeholder            | `string`  | `Please select` | Placeholder text                                               |
| hideEmptyState         | `boolean` | `false`         | When no items hide list                                        |
| listOpen               | `boolean` | `false`         | Open/close list                                                |
| class                  | `string`  | `''`            | container classes                                              |
| containerStyles        | `string`  | `''`            | Add inline styles to container                                 |
| clearable              | `boolean` | `true`          | Enable clearing of value(s)                                    |
| disabled               | `boolean` | `false`         | Disable select                                                 |
| multiple               | `boolean` | `false`         | Enable multi-select                                            |
| searchable             | `boolean` | `true`          | If `false` search/filtering is disabled                        |
| groupHeaderSelectable  | `boolean` | `false`         | Enable selectable group headers                                |
| focused                | `boolean` | `false`         | Controls input focus                                           |
| listAutoWidth          | `boolean` | `true`          | If `false` will ignore width of select                         |
| showChevron            | `boolean` | `false`         | Show chevron                                                   |
| inputAttributes        | `object`  | `{}`            | Pass in HTML attributes to Select's input                      |
| placeholderAlwaysShow  | `boolean` | `false`         | When `multiple` placeholder text will always show              |
| loading                | `boolean` | `false`         | Shows `loading-icon`. `loadOptions` will override this         |
| listOffset             | `number`  | `5`             | `px` space between select and list                             |
| debounceWait           | `number`  | `300`           | `milliseconds` debounce wait                                   |
| floatingConfig         | `object`  | `{}`            | [Floating UI Config](https://floating-ui.com/)                 |
| hasError               | `boolean` | `false`         | If `true` sets error class and styles                          |
| name                   | `string`  | `null`          | Name attribute of hidden input, helpful for form actions       |
| required               | `boolean` | `false`         | If `Select` is within a `<form>` will restrict form submission |
| multiFullItemClearable | `boolean` | `false`         | When `multiple` selected items will clear on click             |
| closeListOnChange      | `boolean` | `true`          | After a change the list will close                             |
| clearFilterTextOnBlur  | `boolean` | `true`          | If `false`, `filterText` value is preserved on blur            |


## Snippets

Customise any part with a [snippet](https://svelte.dev/docs/svelte/snippet). All
are optional; defaults are used when omitted.

```svelte
<Select {items}>
  {#snippet prepend()}…{/snippet}
  {#snippet selection(selection, index)}{selection.label}{/snippet}
  {#snippet clearIcon()}…{/snippet}
  {#snippet multiClearIcon()}…{/snippet}
  {#snippet loadingIcon()}…{/snippet}
  {#snippet chevronIcon(listOpen)}…{/snippet}
  {#snippet listPrepend()}…{/snippet}
  {#snippet list(filteredItems)}…{/snippet}
  {#snippet listAppend()}…{/snippet}
  {#snippet item(item, index)}{item.label}{/snippet}
  {#snippet empty()}No options{/snippet}
  {#snippet inputHidden(value)}…{/snippet}
  {#snippet requiredSnippet(value)}…{/snippet}
</Select>
```


## Events (callback props)

Pass callbacks as props. Each receives its payload directly (no `event.detail`).

| Prop          | Payload           | Description                                                                |
| ------------- | ----------------- | -------------------------------------------------------------------------- |
| `onchange`    | value             | fires when the user selects an option                                      |
| `onselect`    | selection         | fires when an option is selected                                           |
| `oninput`     | value             | fires when the value has changed                                           |
| `onfocus`     | FocusEvent        | fires when select > input focuses                                          |
| `onblur`      | FocusEvent        | fires when select > input blurs                                            |
| `onclear`     | removed item(s)   | fires when clear is invoked or an item is removed from a multi select      |
| `onloaded`    | { items }         | fires when `loadOptions` resolves                                          |
| `onerror`     | { type, details } | fires when an error is caught                                              |
| `onfilter`    | items             | fires when `listOpen: true` and items are filtered                         |
| `onhoveritem` | index             | fires when hoverItemIndex changes                                          |

```svelte
<Select {items} onchange={(value) => console.log(value)} />
```


### Items

`items` can be simple arrays or collections.

```html
<script>
  import Select from 'svelte-select-runes';

  let simple = ['one', 'two', 'three'];

  let collection = [
    { value: 1, label: 'one' },
    { value: 2, label: 'two' },
    { value: 3, label: 'three' },
  ];
</script>

<Select items={simple} />

<Select items={collection} />
```

They can also be grouped and include non-selectable items.

```html
<script>
  import Select from 'svelte-select-runes';

  const items = [
    {value: 'chocolate', label: 'Chocolate', group: 'Sweet'},
    {value: 'pizza', label: 'Pizza', group: 'Savory'},
    {value: 'cake', label: 'Cake', group: 'Sweet', selectable: false},
    {value: 'chips', label: 'Chips', group: 'Savory'},
    {value: 'ice-cream', label: 'Ice Cream', group: 'Sweet'}
  ];

  const groupBy = (item) => item.group;
</script>

<Select {items} {groupBy} />
```

You can also use custom collections.

```html
<script>
  import Select from 'svelte-select-runes';

  const itemId = 'id';
  const label = 'title';

  const items = [
    {id: 0, title: 'Foo'},
    {id: 1, title: 'Bar'},
  ];
</script>

<Select {itemId} {label} {items} />
```

### Async Items

To load items asynchronously then `loadOptions` is the simplest solution. Supply a function that returns a `Promise` that resolves with a list of items. `loadOptions` has debounce baked in and fires each time `filterText` is updated.

```html
<script>
  import Select from 'svelte-select-runes';

  import { someApiCall } from './services';

  async function examplePromise(filterText) {
    // Put your async code here...
    // For example call an API using filterText as your search params
    // When your API responds resolve your Promise
    let res = await someApiCall(filterText);
    return res;
  }
</script>

<Select loadOptions={examplePromise} />
```


### Advanced List Positioning / Floating 

`svelte-select` uses [floating-ui](https://floating-ui.com/) to control the list floating. See their docs and pass in your config via the `floatingConfig` prop.

```html
<script>
  import Select from 'svelte-select-runes';

  let floatingConfig = {
    strategy: 'fixed'
  }
</script>

<Select {floatingConfig} />
```

### Exposed methods
These internal functions are exposed to override if needed. Look through the test file (test/src/index.js) for examples.

```js
export let itemFilter = (label, filterText, option) => label.toLowerCase().includes(filterText.toLowerCase());
```

```js
export let groupBy = undefined;
```

```js
export let groupFilter = groups => groups;
```

```js
export let createGroupHeaderItem = groupValue => {
  return {
    value: groupValue,
    label: groupValue
  };
};
```

```js
export function handleClear() {
  value = undefined;
  listOpen = false;
  dispatch("clear", value);
  handleFocus();
}
```

```js
export let loadOptions = undefined; // if used must return a Promise that updates 'items'
/* Return an object with { cancelled: true } to keep the loading state as active. */
```

```js
export const getFilteredItems = () => {
  return filteredItems;
};
```

```js
export let debounce = (fn, wait = 1) => {
  clearTimeout(timeout);
  timeout = setTimeout(fn, wait);
};
```

Override core functionality at your own risk! See ([get-items.js](/src/lib/get-items.js) & [filter.js](/src/lib/filter.js))

```js
    // core replaceable methods...
    <Select 
      filter={...}
      getItems={...}
    />
```

## A11y (Accessibility)

Override these methods to change the `aria-context` and `aria-selection` text.

```js
export let ariaValues = (values) => {
  return `Option ${values}, selected.`;
}

export let ariaListOpen = (label, count) => {
  return `You are currently focused on option ${label}. There are ${count} results available.`;
}

export let ariaFocused = () => {
  return `Select is focused, type to refine list, press down to open the menu.`;
}
```

## CSS custom properties (tokens)

Style the component with the layered [`--svelte-select-*` token system](/docs/theming_variables.md).
Override a few Tier 1 primitives to retheme everything, or target individual
parts. (The old flat variables like `--border-radius` still work but are
deprecated.)

```svelte
<script>
  import Select from 'svelte-select-runes';
</script>

<!-- retheme via primitives -->
<Select --svelte-select-radius="10px" --svelte-select-accent="rebeccapurple" />
```

### Dark mode

Set `data-theme="dark"` on the `.svelte-select` element or any ancestor.

You can also use the `inputStyles` prop to write in any override styles needed for the input.

```html
<script>
  import Select from 'svelte-select-runes';

  const items = ['One', 'Two', 'Three'];
</script>

<Select {items} inputStyles="box-sizing: border-box;"></Select>
```

### Replacing styles

The component's styles are token-driven, so most theming is done via the
`--svelte-select-*` tokens above (and `data-theme="dark"`). To go further, target
the component's class names (`.svelte-select`, `.svelte-select-list`, `.item`,
`.multi-item`, …) with your own global CSS.


## Credits

`svelte-select` was created by [Robert Balfré](https://github.com/rob-balfre).
Source and full history: [rob-balfre/svelte-select](https://github.com/rob-balfre/svelte-select).

This Svelte 5 release (v6) is a fork maintained at
[Solidor777/svelte-select-5](https://github.com/Solidor777/svelte-select-5),
building on Robert's original work.

## License

[LIL](LICENSE)
