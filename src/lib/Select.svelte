<script>
    import { onMount, untrack } from 'svelte';
    import { offset, flip, shift } from 'svelte-floating-ui/dom';
    import { createFloatingActions } from 'svelte-floating-ui';

    import { filterItems, convertStringItemsToObjects, loadAndConvert } from './filtering.svelte.js';
    import { coerceValue, computeJustValue } from './selection.svelte.js';

    import ChevronIcon from './ChevronIcon.svelte';
    import ClearIcon from './ClearIcon.svelte';
    import LoadingIcon from './LoadingIcon.svelte';
    import List from './List.svelte';
    import SingleSelection from './SingleSelection.svelte';
    import MultiSelection from './MultiSelection.svelte';

    let timeout;

    let {
        // Two-way-bindable state
        justValue = $bindable(null),
        value = $bindable(null),
        filterText = $bindable(''),
        focused = $bindable(false),
        listOpen = $bindable(false),
        hoverItemIndex = $bindable(0),
        items = $bindable(null),
        loading = $bindable(false),
        container = $bindable(undefined),
        input = $bindable(undefined),

        // Behavior props
        filter = filterItems,
        getItems = loadAndConvert,
        id = null,
        name = null,
        multiple = false,
        multiFullItemClearable = false,
        disabled = false,
        placeholder = 'Please select',
        placeholderAlwaysShow = false,
        label = 'label',
        itemFilter = (label, filterText, option) => `${label}`.toLowerCase().includes(filterText.toLowerCase()),
        groupBy = undefined,
        groupFilter = (groups) => groups,
        groupHeaderSelectable = false,
        itemId = 'value',
        loadOptions = undefined,
        containerStyles = '',
        hasError = false,
        filterSelectedItems = true,
        required = false,
        closeListOnChange = true,
        clearFilterTextOnBlur = true,
        createGroupHeaderItem = (groupValue, item) => ({ value: groupValue, [label]: groupValue }),
        searchable = true,
        inputStyles = '',
        clearable = true,
        debounce = (fn, wait = 1) => {
            clearTimeout(timeout);
            timeout = setTimeout(fn, wait);
        },
        debounceWait = 300,
        hideEmptyState = false,
        inputAttributes = {},
        listAutoWidth = true,
        showChevron = false,
        listOffset = 5,
        floatingConfig = {},
        ariaValues = (values) => `Option ${values}, selected.`,
        ariaListOpen = (label, count) => `You are currently focused on option ${label}. There are ${count} results available.`,
        ariaFocused = () => `Select is focused, type to refine list, press down to open the menu.`,
        class: containerClasses = '',

        // Callback props (replace createEventDispatcher events)
        onchange,
        onselect,
        oninput,
        onclear,
        onfocus,
        onblur,
        onhoveritem,
        onfilter,
        onerror,
        onloaded,

        // Snippets (replace named slots)
        prepend,
        selection,
        clearIcon,
        multiClearIcon,
        loadingIcon,
        chevronIcon,
        list,
        listPrepend,
        listAppend,
        item,
        empty,
        inputHidden,
        requiredSnippet,
    } = $props();

    let activeValue = $state();
    let listEl = $state();

    // listOpen at init implies focused, seeded before the `!focused` close effect
    // runs so an initially-open list is not immediately closed.
    if (listOpen) focused = true;

    // Previous-cycle snapshots (mirror the original beforeUpdate lag).
    let prev_value;
    let prev_filterText;
    let prev_multiple;

    export function getFilteredItems() {
        return filteredItems;
    }

    function setValue() {
        value = coerceValue(value, { items, itemId, multiple });
    }

    function filterGroupedItems(_items) {
        const groupValues = [];
        const groups = {};

        _items.forEach((item) => {
            const groupValue = groupBy(item);

            if (!groupValues.includes(groupValue)) {
                groupValues.push(groupValue);
                groups[groupValue] = [];

                if (groupValue) {
                    groups[groupValue].push(
                        Object.assign(createGroupHeaderItem(groupValue, item), {
                            id: groupValue,
                            groupHeader: true,
                            selectable: groupHeaderSelectable,
                        })
                    );
                }
            }

            groups[groupValue].push(Object.assign({ groupItem: !!groupValue }, item));
        });

        const sortedGroupedItems = [];
        groupFilter(groupValues).forEach((groupValue) => {
            if (groups[groupValue]) sortedGroupedItems.push(...groups[groupValue]);
        });

        return sortedGroupedItems;
    }

    function dispatchSelectedItem() {
        if (multiple) {
            if (JSON.stringify(value) !== JSON.stringify(prev_value)) {
                if (checkValueForDuplicates()) {
                    oninput?.(value);
                }
            }
            return;
        }

        if (!prev_value || JSON.stringify(value[itemId]) !== JSON.stringify(prev_value[itemId])) {
            oninput?.(value);
        }
    }

    function setupMulti() {
        if (value) {
            value = Array.isArray(value) ? [...value] : [value];
        }
    }

    function setupSingle() {
        if (value) value = null;
    }

    function setValueIndexAsHoverIndex() {
        const valueIndex = filteredItems.findIndex((i) => i[itemId] === value[itemId]);
        checkHoverSelectable(valueIndex, true);
    }

    function checkHoverSelectable(startingIndex = 0, ignoreGroup) {
        hoverItemIndex = startingIndex < 0 ? 0 : startingIndex;
        if (!ignoreGroup && groupBy && filteredItems[hoverItemIndex] && !filteredItems[hoverItemIndex].selectable) {
            setHoverIndex(1);
        }
    }

    function setupFilterText() {
        if (!loadOptions && filterText.length === 0) return;

        if (loadOptions) {
            debounce(async function () {
                loading = true;
                let res = await getItems({
                    loadOptions,
                    convertStringItemsToObjects,
                    filterText,
                    onError: onerror,
                    onLoaded: onloaded,
                });

                if (res) {
                    loading = res.loading;
                    listOpen = listOpen ? res.listOpen : filterText.length > 0 ? true : false;
                    focused = listOpen && res.focused;
                    items = groupBy ? filterGroupedItems(res.filteredItems) : res.filteredItems;
                } else {
                    loading = false;
                    focused = true;
                    listOpen = true;
                }
            }, debounceWait);
        } else {
            listOpen = true;
            if (multiple) activeValue = undefined;
        }
    }

    function checkValueForDuplicates() {
        let noDuplicates = true;
        if (value) {
            const ids = [];
            const uniqueValues = [];

            value.forEach((val) => {
                if (!ids.includes(val[itemId])) {
                    ids.push(val[itemId]);
                    uniqueValues.push(val);
                } else {
                    noDuplicates = false;
                }
            });

            if (!noDuplicates) value = uniqueValues;
        }
        return noDuplicates;
    }

    function findItem(selection) {
        let matchTo = selection ? selection[itemId] : value[itemId];
        return items.find((item) => item[itemId] === matchTo);
    }

    function updateValueDisplay(items) {
        if (!items || items.length === 0 || items.some((item) => typeof item !== 'object')) return;
        if (!value || (multiple ? value.some((selection) => !selection || !selection[itemId]) : !value[itemId])) return;

        if (Array.isArray(value)) {
            value = value.map((selection) => findItem(selection) || selection);
        } else {
            value = findItem() || value;
        }
    }

    function handleMultiItemClear(i) {
        const itemToRemove = value[i];

        if (value.length === 1) {
            value = undefined;
        } else {
            value = value.filter((item) => item !== itemToRemove);
        }

        onclear?.(itemToRemove);
    }

    function handleKeyDown(e) {
        if (!focused) return;
        e.stopPropagation();
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                closeList();
                break;
            case 'Enter':
                e.preventDefault();
                if (listOpen) {
                    if (filteredItems.length === 0) break;
                    const hoverItem = filteredItems[hoverItemIndex];

                    if (value && !multiple && value[itemId] === hoverItem[itemId]) {
                        closeList();
                        break;
                    } else {
                        handleSelect(filteredItems[hoverItemIndex]);
                    }
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (listOpen) {
                    setHoverIndex(1);
                } else {
                    listOpen = true;
                    activeValue = undefined;
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (listOpen) {
                    setHoverIndex(-1);
                } else {
                    listOpen = true;
                    activeValue = undefined;
                }
                break;
            case 'Tab':
                if (listOpen && focused) {
                    if (filteredItems.length === 0 || (value && value[itemId] === filteredItems[hoverItemIndex][itemId]))
                        return closeList();

                    e.preventDefault();
                    handleSelect(filteredItems[hoverItemIndex]);
                    closeList();
                }
                break;
            case 'Backspace':
                if (!multiple || filterText.length > 0) return;
                if (multiple && value && value.length > 0) {
                    handleMultiItemClear(activeValue !== undefined ? activeValue : value.length - 1);
                    if (activeValue === 0 || activeValue === undefined) break;
                    activeValue = value.length > activeValue ? activeValue - 1 : undefined;
                }
                break;
            case 'ArrowLeft':
                if (!value || !multiple || filterText.length > 0) return;
                if (activeValue === undefined) {
                    activeValue = value.length - 1;
                } else if (value.length > activeValue && activeValue !== 0) {
                    activeValue -= 1;
                }
                break;
            case 'ArrowRight':
                if (!value || !multiple || filterText.length > 0 || activeValue === undefined) return;
                if (activeValue === value.length - 1) {
                    activeValue = undefined;
                } else if (activeValue < value.length - 1) {
                    activeValue += 1;
                }
                break;
        }
    }

    function handleFocus(e) {
        if (focused && input === document?.activeElement) return;
        if (e) onfocus?.(e);
        input?.focus();
        focused = true;
    }

    function handleBlur(e) {
        if (listOpen || focused) {
            onblur?.(e);
            closeList();
            focused = false;
            activeValue = undefined;
            input?.blur();
        }
    }

    function handleClick() {
        if (disabled) return;
        if (filterText.length > 0) return (listOpen = true);
        listOpen = !listOpen;
    }

    export function handleClear() {
        onclear?.(value);
        value = undefined;
        closeList();
        handleFocus();
    }

    function itemSelected(selection) {
        if (selection) {
            filterText = '';
            const item = Object.assign({}, selection);

            if (item.groupHeader && !item.selectable) return;
            value = multiple ? (value ? value.concat([item]) : [item]) : (value = item);

            setTimeout(() => {
                if (closeListOnChange) closeList();
                activeValue = undefined;
                onchange?.(value);
                onselect?.(selection);
            });
        }
    }

    function closeList() {
        if (clearFilterTextOnBlur) filterText = '';
        listOpen = false;
    }

    function handleAriaSelection(_multiple) {
        let selected = undefined;
        if (_multiple && value.length > 0) {
            selected = value.map((v) => v[label]).join(', ');
        } else {
            selected = value[label];
        }
        return ariaValues(selected);
    }

    function handleAriaContent() {
        if (!filteredItems || filteredItems.length === 0) return '';
        let _item = filteredItems[hoverItemIndex];
        if (listOpen && _item) {
            let count = filteredItems ? filteredItems.length : 0;
            return ariaListOpen(_item[label], count);
        } else {
            return ariaFocused();
        }
    }

    function handleClickOutside(event) {
        if (!listOpen && !focused && container && !container.contains(event.target) && !listEl?.contains(event.target)) {
            handleBlur();
        }
    }

    function handleSelect(item) {
        if (!item || item.selectable === false) return;
        itemSelected(item);
    }

    function handleHover(i) {
        hoverItemIndex = i;
    }

    function handleItemClick(args) {
        const { item, i } = args;
        if (item?.selectable === false) return;
        if (value && !multiple && value[itemId] === item[itemId]) return closeList();
        if (isItemSelectable(item)) {
            if (i !== undefined) hoverItemIndex = i;
            handleSelect(item);
        }
    }

    function setHoverIndex(increment) {
        let selectableFilteredItems = filteredItems.filter(
            (item) => !Object.hasOwn(item, 'selectable') || item.selectable === true
        );

        if (selectableFilteredItems.length === 0) {
            return (hoverItemIndex = 0);
        }

        if (increment > 0 && hoverItemIndex === filteredItems.length - 1) {
            hoverItemIndex = 0;
        } else if (increment < 0 && hoverItemIndex === 0) {
            hoverItemIndex = filteredItems.length - 1;
        } else {
            hoverItemIndex = hoverItemIndex + increment;
        }

        const hover = filteredItems[hoverItemIndex];
        if (hover && hover.selectable === false) {
            if (increment === 1 || increment === -1) setHoverIndex(increment);
        }
    }

    function isItemSelectable(item) {
        return (item.groupHeader && item.selectable) || item.selectable || !Object.hasOwn(item, 'selectable');
    }

    function handleFilterEvent(items) {
        if (listOpen) onfilter?.(items);
    }

    // Floating UI: ref on the control, content action passed down to List.
    let _floatingConfig = {
        strategy: 'absolute',
        placement: 'bottom-start',
        middleware: [offset(listOffset), flip(), shift()],
        autoUpdate: false,
    };
    const [floatingRef, floatingContent, floatingUpdate] = createFloatingActions(_floatingConfig);

    // Derived state (pure).
    let _inputAttributes = $derived.by(() => {
        const attrs = Object.assign(
            {
                autocapitalize: 'none',
                autocomplete: 'off',
                autocorrect: 'off',
                spellcheck: false,
                tabindex: 0,
                type: 'text',
                'aria-autocomplete': 'list',
            },
            inputAttributes
        );
        if (id) attrs.id = id;
        if (!searchable) attrs.readonly = true;
        return attrs;
    });

    let filteredItems = $derived(
        filter({
            loadOptions,
            filterText,
            items,
            multiple,
            value,
            itemId,
            groupBy,
            label,
            filterSelectedItems,
            itemFilter,
            convertStringItemsToObjects,
            filterGroupedItems,
        })
    );

    let hasValue = $derived(multiple ? value && value.length > 0 : value);
    let hideSelectedItem = $derived(hasValue && filterText.length > 0);
    let showClear = $derived(hasValue && clearable && !disabled && !loading);
    let placeholderText = $derived(
        placeholderAlwaysShow && multiple
            ? placeholder
            : multiple && value?.length === 0
            ? placeholder
            : value
            ? ''
            : placeholder
    );
    let ariaSelection = $derived(value ? handleAriaSelection(multiple) : '');
    let ariaContext = $derived(handleAriaContent(filteredItems, hoverItemIndex, focused, listOpen));

    // Effects. Each mirrors a Svelte 3 `$:` statement: the tracked reads match
    // the variables the original statement referenced directly; mutation helpers
    // run inside untrack() so they don't widen the dependency set into a loop
    // (Svelte 3 never tracked variables read only inside called functions).
    $effect(() => {
        items;
        value;
        untrack(() => setValue());
    });

    $effect(() => {
        if (multiple) untrack(() => setupMulti());
    });

    $effect(() => {
        multiple;
        untrack(() => {
            if (prev_multiple && !multiple) setupSingle();
        });
    });

    $effect(() => {
        if (multiple && value && value.length > 1) untrack(() => checkValueForDuplicates());
    });

    $effect(() => {
        if (value) untrack(() => dispatchSelectedItem());
    });

    $effect(() => {
        if (!value && multiple && prev_value) untrack(() => oninput?.(value));
    });

    $effect(() => {
        if (!multiple && prev_value && !value) untrack(() => oninput?.(value));
    });

    $effect(() => {
        if (!focused && input) untrack(() => closeList());
    });

    $effect(() => {
        filterText;
        untrack(() => {
            if (filterText !== prev_filterText) setupFilterText();
        });
    });

    $effect(() => {
        if (!multiple && listOpen && value && filteredItems) untrack(() => setValueIndexAsHoverIndex());
    });

    $effect(() => {
        hoverItemIndex;
        untrack(() => onhoveritem?.(hoverItemIndex));
    });

    $effect(() => {
        items;
        untrack(() => updateValueDisplay(items));
    });

    $effect(() => {
        justValue = computeJustValue(value, itemId, multiple);
    });

    $effect(() => {
        if (listOpen && filteredItems && !multiple && !value) untrack(() => checkHoverSelectable());
    });

    $effect(() => {
        filteredItems;
        untrack(() => handleFilterEvent(filteredItems));
    });

    $effect(() => {
        if (container && floatingConfig) untrack(() => floatingUpdate(Object.assign(_floatingConfig, floatingConfig)));
    });

    $effect(() => {
        if (container && floatingConfig?.autoUpdate === undefined) untrack(() => (_floatingConfig.autoUpdate = true));
    });

    $effect(() => {
        if (listOpen && multiple) untrack(() => (hoverItemIndex = 0));
    });

    $effect(() => {
        if (input && listOpen && !focused) untrack(() => handleFocus());
    });

    $effect(() => {
        filterText;
        untrack(() => {
            if (filterText) hoverItemIndex = 0;
        });
    });

    // Trailing effect: snapshot current values as "previous" for the next cycle
    // (replaces beforeUpdate). Placed last so reader effects above see the lagged
    // values before this overwrites them.
    $effect(() => {
        value;
        filterText;
        multiple;
        prev_value = value;
        prev_filterText = filterText;
        prev_multiple = multiple;
    });

    onMount(() => {
        if (listOpen) focused = true;
        if (focused && input) input.focus();
    });
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeyDown} />

<div
    class="svelte-select {containerClasses}"
    class:multi={multiple}
    class:disabled
    class:focused
    class:list-open={listOpen}
    class:show-chevron={showChevron}
    class:error={hasError}
    style={containerStyles}
    onpointerup={(e) => {
        e.preventDefault();
        handleClick();
    }}
    bind:this={container}
    use:floatingRef
    role="none">
    {#if listOpen}
        <List
            bind:listEl
            bind:hoverItemIndex
            {filteredItems}
            {label}
            {itemId}
            {value}
            {multiple}
            {hideEmptyState}
            {listAutoWidth}
            floatingContent={floatingContent}
            getContainerWidth={() => container?.getBoundingClientRect().width}
            onhover={handleHover}
            onselect={(it, i) => handleItemClick({ item: it, i })}
            {item}
            {empty}
            {listPrepend}
            {listAppend}
            {list} />
    {/if}

    <span aria-live="polite" aria-atomic="false" aria-relevant="additions text" class="a11y-text">
        {#if focused}
            <span id="aria-selection">{ariaSelection}</span>
            <span id="aria-context">{ariaContext}</span>
        {/if}
    </span>

    <div class="prepend">
        {#if prepend}{@render prepend()}{/if}
    </div>

    <div class="value-container">
        {#if hasValue}
            {#if multiple}
                <MultiSelection
                    {value}
                    {label}
                    {disabled}
                    {multiFullItemClearable}
                    {activeValue}
                    onclear={handleMultiItemClear}
                    {selection}
                    {multiClearIcon} />
            {:else}
                <SingleSelection {value} {label} {hideSelectedItem} {selection} />
            {/if}
        {/if}

        <input
            onkeydown={handleKeyDown}
            onblur={handleBlur}
            onfocus={handleFocus}
            readonly={!searchable}
            {..._inputAttributes}
            bind:this={input}
            bind:value={filterText}
            placeholder={placeholderText}
            style={inputStyles}
            {disabled} />
    </div>

    <div class="indicators">
        {#if loading}
            <div class="icon loading" aria-hidden="true">
                {#if loadingIcon}{@render loadingIcon()}{:else}<LoadingIcon />{/if}
            </div>
        {/if}

        {#if showClear}
            <button type="button" class="icon clear-select" onclick={handleClear}>
                {#if clearIcon}{@render clearIcon()}{:else}<ClearIcon />{/if}
            </button>
        {/if}

        {#if showChevron}
            <div class="icon chevron" aria-hidden="true">
                {#if chevronIcon}{@render chevronIcon(listOpen)}{:else}<ChevronIcon />{/if}
            </div>
        {/if}
    </div>

    {#if inputHidden}{@render inputHidden(value)}{:else}
        <input {name} type="hidden" value={value ? JSON.stringify(value) : null} />
    {/if}

    {#if required && (!value || value.length === 0)}
        {#if requiredSnippet}{@render requiredSnippet(value)}{:else}
            <select class="required" required tabindex="-1" aria-hidden="true"></select>
        {/if}
    {/if}
</div>

<style>
    .svelte-select {
        /* deprecating camelCase custom props in favour of kebab-case for v5 */
        --borderRadius: var(--border-radius);
        --clearSelectColor: var(--clear-select-color);
        --clearSelectWidth: var(--clear-select-width);
        --disabledBackground: var(--disabled-background);
        --disabledBorderColor: var(--disabled-border-color);
        --disabledColor: var(--disabled-color);
        --disabledPlaceholderColor: var(--disabled-placeholder-color);
        --disabledPlaceholderOpacity: var(--disabled-placeholder-opacity);
        --errorBackground: var(--error-background);
        --errorBorder: var(--error-border);
        --groupItemPaddingLeft: var(--group-item-padding-left);
        --groupTitleColor: var(--group-title-color);
        --groupTitleFontSize: var(--group-title-font-size);
        --groupTitleFontWeight: var(--group-title-font-weight);
        --groupTitlePadding: var(--group-title-padding);
        --groupTitleTextTransform: var(--group-title-text-transform);
        --groupTitleBorderColor: var(--group-title-border-color);
        --groupTitleBorderWidth: var(--group-title-border-width);
        --groupTitleBorderStyle: var(--group-title-border-style);
        --indicatorColor: var(--chevron-color);
        --indicatorHeight: var(--chevron-height);
        --indicatorWidth: var(--chevron-width);
        --inputColor: var(--input-color);
        --inputLeft: var(--input-left);
        --inputLetterSpacing: var(--input-letter-spacing);
        --inputMargin: var(--input-margin);
        --inputPadding: var(--input-padding);
        --itemActiveBackground: var(--item-active-background);
        --itemColor: var(--item-color);
        --itemFirstBorderRadius: var(--item-first-border-radius);
        --itemHoverBG: var(--item-hover-bg);
        --itemHoverColor: var(--item-hover-color);
        --itemIsActiveBG: var(--item-is-active-bg);
        --itemIsActiveColor: var(--item-is-active-color);
        --itemIsNotSelectableColor: var(--item-is-not-selectable-color);
        --itemPadding: var(--item-padding);
        --listBackground: var(--list-background);
        --listBorder: var(--list-border);
        --listBorderRadius: var(--list-border-radius);
        --listEmptyColor: var(--list-empty-color);
        --listEmptyPadding: var(--list-empty-padding);
        --listEmptyTextAlign: var(--list-empty-text-align);
        --listMaxHeight: var(--list-max-height);
        --listPosition: var(--list-position);
        --listShadow: var(--list-shadow);
        --listZIndex: var(--list-z-index);
        --multiItemBG: var(--multi-item-bg);
        --multiItemBorderRadius: var(--multi-item-border-radius);
        --multiItemDisabledHoverBg: var(--multi-item-disabled-hover-bg);
        --multiItemDisabledHoverColor: var(--multi-item-disabled-hover-color);
        --multiItemHeight: var(--multi-item-height);
        --multiItemMargin: var(--multi-item-margin);
        --multiItemPadding: var(--multi-item-padding);
        --multiSelectInputMargin: var(--multi-select-input-margin);
        --multiSelectInputPadding: var(--multi-select-input-padding);
        --multiSelectPadding: var(--multi-select-padding);
        --placeholderColor: var(--placeholder-color);
        --placeholderOpacity: var(--placeholder-opacity);
        --selectedItemPadding: var(--selected-item-padding);
        --spinnerColor: var(--spinner-color);
        --spinnerHeight: var(--spinner-height);
        --spinnerWidth: var(--spinner-width);

        --internal-padding: 0 0 0 16px;

        border: var(--border, 1px solid #d8dbdf);
        border-radius: var(--border-radius, 6px);
        min-height: var(--height, 42px);
        position: relative;
        display: flex;
        align-items: stretch;
        padding: var(--padding, var(--internal-padding));
        background: var(--background, #fff);
        margin: var(--margin, 0);
        width: var(--width, 100%);
        font-size: var(--font-size, 16px);
        max-height: var(--max-height);
    }

    * {
        box-sizing: var(--box-sizing, border-box);
    }

    .svelte-select:hover {
        border: var(--border-hover, 1px solid #b2b8bf);
    }

    .value-container {
        display: flex;
        flex: 1 1 0%;
        flex-wrap: wrap;
        align-items: center;
        gap: 5px 10px;
        padding: var(--value-container-padding, 5px 0);
        position: relative;
        overflow: var(--value-container-overflow, hidden);
        align-self: stretch;
    }

    .prepend,
    .indicators {
        display: flex;
        flex-shrink: 0;
        align-items: center;
    }

    .indicators {
        position: var(--indicators-position);
        top: var(--indicators-top);
        right: var(--indicators-right);
        bottom: var(--indicators-bottom);
    }

    input {
        position: absolute;
        cursor: default;
        border: none;
        color: var(--input-color, var(--item-color));
        padding: var(--input-padding, 0);
        letter-spacing: var(--input-letter-spacing, inherit);
        margin: var(--input-margin, 0);
        min-width: 10px;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: transparent;
        font-size: var(--font-size, 16px);
    }

    :not(.multi) > .value-container > input {
        width: 100%;
        height: 100%;
    }

    input::placeholder {
        color: var(--placeholder-color, #78848f);
        opacity: var(--placeholder-opacity, 1);
    }

    input:focus {
        outline: none;
    }

    .svelte-select.focused {
        border: var(--border-focused, 1px solid #006fe8);
        border-radius: var(--border-radius-focused, var(--border-radius, 6px));
    }

    .disabled {
        background: var(--disabled-background, #ebedef);
        border-color: var(--disabled-border-color, #ebedef);
        color: var(--disabled-color, #c1c6cc);
    }

    .disabled input::placeholder {
        color: var(--disabled-placeholder-color, #c1c6cc);
        opacity: var(--disabled-placeholder-opacity, 1);
    }

    .icon {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .clear-select {
        all: unset;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--clear-select-width, 40px);
        height: var(--clear-select-height, 100%);
        color: var(--clear-select-color, var(--icons-color));
        margin: var(--clear-select-margin, 0);
        pointer-events: all;
        flex-shrink: 0;
    }

    .clear-select:focus {
        outline: var(--clear-select-focus-outline, 1px solid #006fe8);
    }

    .loading {
        width: var(--loading-width, 40px);
        height: var(--loading-height);
        color: var(--loading-color, var(--icons-color));
        margin: var(--loading--margin, 0);
        flex-shrink: 0;
    }

    .chevron {
        width: var(--chevron-width, 40px);
        height: var(--chevron-height, 40px);
        background: var(--chevron-background, transparent);
        pointer-events: var(--chevron-pointer-events, none);
        color: var(--chevron-color, var(--icons-color));
        border: var(--chevron-border, 0 0 0 1px solid #d8dbdf);
        flex-shrink: 0;
    }

    .multi {
        padding: var(--multi-select-padding, var(--internal-padding));
    }

    .multi input {
        padding: var(--multi-select-input-padding, 0);
        position: relative;
        margin: var(--multi-select-input-margin, 5px 0);
        flex: 1 1 40px;
    }

    .svelte-select.error {
        border: var(--error-border, 1px solid #ff2d55);
        background: var(--error-background, #fff);
    }

    .a11y-text {
        z-index: 9999;
        border: 0px;
        clip: rect(1px, 1px, 1px, 1px);
        height: 1px;
        width: 1px;
        position: absolute;
        overflow: hidden;
        padding: 0px;
        white-space: nowrap;
    }

    .required {
        opacity: 0;
        z-index: -1;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
    }
</style>
