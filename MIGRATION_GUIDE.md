## Migrating from v5 to v6 (Svelte 5)

v6 requires **Svelte 5** and is a runes rewrite. It includes ⚠️ BREAKING CHANGES ⚠️.

### Events → callback props

`createEventDispatcher` events are gone; pass callback props instead.

| v5 event | v6 prop | Payload |
|---|---|---|
| `on:change` | `onchange` | selected value |
| `on:select` | `onselect` | selection |
| `on:input` | `oninput` | value |
| `on:clear` | `onclear` | removed item(s) |
| `on:focus` | `onfocus` | FocusEvent |
| `on:blur` | `onblur` | FocusEvent |
| `on:hoverItem` | `onhoveritem` | index |
| `on:filter` | `onfilter` | items |
| `on:error` | `onerror` | `{ type, details }` |
| `on:loaded` | `onloaded` | `{ items }` |

Payloads are passed directly — there is no `event.detail` wrapper.

```svelte
<!-- v5 -->
<Select {items} on:change={(e) => handle(e.detail)} />

<!-- v6 -->
<Select {items} onchange={(value) => handle(value)} />
```

### Slots → snippets

Named slots become snippet props. Default content is preserved when a snippet
isn't supplied. `let:` slot props become snippet parameters.

| v5 slot | v6 snippet | Parameters |
|---|---|---|
| `slot="prepend"` | `{#snippet prepend()}` | — |
| `slot="selection"` | `{#snippet selection(selection, index)}` | selection, index |
| `slot="clear-icon"` | `{#snippet clearIcon()}` | — |
| `slot="multi-clear-icon"` | `{#snippet multiClearIcon()}` | — |
| `slot="loading-icon"` | `{#snippet loadingIcon()}` | — |
| `slot="chevron-icon"` | `{#snippet chevronIcon(listOpen)}` | listOpen |
| `slot="list"` | `{#snippet list(filteredItems)}` | filteredItems |
| `slot="list-prepend"` | `{#snippet listPrepend()}` | — |
| `slot="list-append"` | `{#snippet listAppend()}` | — |
| `slot="item"` | `{#snippet item(item, index)}` | item, index |
| `slot="empty"` | `{#snippet empty()}` | — |
| `slot="input-hidden"` | `{#snippet inputHidden(value)}` | value |
| `slot="required"` | `{#snippet requiredSnippet(value)}` | value |

```svelte
<!-- v5 -->
<Select {items} on:select={handleSelect}>
  <div slot="item" let:item>{item.label}</div>
</Select>

<!-- v6 -->
<Select {items} onselect={handleSelect}>
  {#snippet item(item)}<div>{item.label}</div>{/snippet}
</Select>
```

> Note: the `required` slot is now the `requiredSnippet` prop (the `required`
> boolean prop is unchanged).

### Two-way binding

`value`, `filterText`, `listOpen`, `focused`, `hoverItemIndex`, `justValue`,
`items`, and `loading` are `bind:`-able as before (now backed by `$bindable`).

### CSS: layered tokens

Theming now uses a layered `--svelte-select-*` token system. Override a few
**Tier 1 primitives** (e.g. `--svelte-select-accent`, `--svelte-select-bg`,
`--svelte-select-border-color`, `--svelte-select-radius`) to retheme everything,
or target individual part tokens. See `docs/theming_variables.md` for the full
list.

The old flat variables (`--background`, `--item-hover-bg`, …) **still work** but
are **deprecated** and will be removed in a future major — prefer the
`--svelte-select-*` tokens. The camelCase variables (`--borderRadius`, …),
deprecated since v5, are removed in v6.

### Dark mode

Set `data-theme="dark"` on the `.svelte-select` element or any ancestor.

### `getItems` prop

If you passed a custom `getItems`, its signature changed: it now receives
`{ loadOptions, filterText, convertStringItemsToObjects, onError, onLoaded }`
(callbacks) instead of a `dispatch` function.

---

## Migrating for v4 to v5

v5 is a major release that that includes some ⚠️ BREAKING CHANGES ⚠️ 

### Event changes:
Updated in `5.0.0-beta.39`

`on:change` event fires when the user selects an option.

`on:input` event fires when the value has been changed.

### Removed
Removed `getOptionLabel`, `getGroupHeaderLabel` and `noOptionsMessage`.

Removed `Selection`, `ChevronIcon`, `ClearIcon`, `LoadingIcon`, `Icon`, `List` and `Item` components. Please use named slots instead:

```html
<Select bind:items bind:value>
  <div slot="prepend" />
  <div slot="selection" let:selection />
  <div slot="clear-icon" />  
  <div slot="multi-clear-icon" />
  <div slot="loading-icon" />  
  <div slot="chevron-icon" />  
  <div slot="list" let:filteredItems />  
  <div slot="item" let:item let:index />  
  <div slot="empty" />  
</Select>
```

### `isVirtualList` Removed
You can use named slots to achieve the same results, with more flexibility.
Example at [svelte-select-examples](https://svelte-select-examples.vercel.app/examples/advanced/virtual-list)

### `isCreatable` Removed
Removed `isCreatable` prop and `itemCreated` event, named slots can be used to build your own create method.
Example at [svelte-select-examples](https://svelte-select-examples.vercel.app/examples/advanced/create-item)

### CSS Camel to kebab:

CSS classes and custom properties changed (only depreciated, no need to update if upgrading from v4) from camel to kebab case. For example `selectedItem` → `selected-item` and `--borderRadius` → `--border-radius`

### Redundant CSS custom properties:

The following CSS custom properties were removed in v5.

```css
--clearSelectColor
--clearSelectFocusColor
--clearSelectHoverColor
--groupTitleTextTransform
--indicatorColor
--indicatorFill
--indicatorHeight
--listLeft
--listRight
--multiClearBG
--multiClearFill
--multiClearHeight
--multiClearHoverBG
--multiClearHoverFill
--multiClearPadding
--multiClearRadius
--multiClearTextAlign
--multiClearTop
--multiClearWidth
--multiItemActiveBG
--multiItemActiveColor
--spinnerLeft
--spinnerRight
--virtualListHeight
```


### Other CSS class name changes:
`selectContainer` → `svelte-select`<br/>
`listContainer` → `svelte-select-list`<br/>
`indicator` → `chevron`<br/>
`--clear-icon-colour` → `--clear-icon-color`<br/>
`virtual-list` removed


### Prop changes:
`containerClasses` → `class`<br/>
`MultiSelection` → `Multi`<br/>
`indicatorSvg` → `ChevronIcon`<br/>
`showIndicator` → `showChevron`<br/>
`loadOptionsInterval` → `debounceWait`<br/>
`isMulti` → `multiple`<br/>
`isWaiting` → `loading`<br/>
`isClearable` → `clearable`<br/>
`isFocused` → `focused`<br/>
`isGroupHeaderSelectable` → `groupHeaderSelectable`<br/>
`isDisabled` → `disabled`<br/>
`isSearchable` → `searchable`<br/>
`labelIdentifier` -> `label`<br/>
`optionIdentifier` -> `itemId`<br/>
`selectedValue` removed (was already deprecated in v4 in favour of `value`)<br/>
