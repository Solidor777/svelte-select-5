<script>
    import Item from './Item.svelte';

    let {
        filteredItems = [],
        label = 'label',
        itemId = 'value',
        value = null,
        multiple = false,
        hoverItemIndex = $bindable(0),
        hideEmptyState = false,
        listAutoWidth = true,
        floatingContent = () => ({}),
        getContainerWidth,
        onhover,
        onselect,
        listEl = $bindable(undefined),
        listPrepend,
        listAppend,
        item: itemSnippet,
        empty,
        list: listOverride,
    } = $props();

    // Mounted only while the list is open. Hide for the first frame so floating-ui
    // can position before paint, then reveal (mirrors the original listMounted).
    let prefloat = $state(true);
    $effect(() => {
        prefloat = true;
        const t = setTimeout(() => {
            prefloat = false;
        }, 0);
        return () => clearTimeout(t);
    });

    // Vestigial in the original: never set true, so the hover guard never fires.
    // Preserved for behavioral parity.
    let isScrolling = false;
    let isScrollingTimer;

    function handleListScroll() {
        clearTimeout(isScrollingTimer);
        isScrollingTimer = setTimeout(() => {
            isScrolling = false;
        }, 100);
    }

    function isItemActive(item) {
        if (multiple) return false;
        return value && value[itemId] === item[itemId];
    }

    function handleHover(i) {
        if (isScrolling) return;
        onhover?.(i);
    }

    function handleItemClick(item, i) {
        onselect?.(item, i);
    }

    // Scrolls the active/hovered row into view. Mirrors the original update-only
    // behavior: only reacts when the scroll target changes, not on initial mount.
    function scrollAction(node) {
        return {
            update(args) {
                if (args.active || args.hover) {
                    handleListScroll();
                    node.scrollIntoView?.({ behavior: 'auto', block: 'nearest' });
                }
            },
        };
    }

    // Width sync: list matches the control width unless listAutoWidth is false.
    $effect(() => {
        if (!listEl || typeof getContainerWidth !== 'function') return;
        const width = getContainerWidth();
        listEl.style.width = listAutoWidth && width ? width + 'px' : 'auto';
    });
</script>

<div
    use:floatingContent
    bind:this={listEl}
    class="svelte-select-list"
    class:prefloat
    onscroll={handleListScroll}
    onpointerup={(e) => {
        e.preventDefault();
        e.stopPropagation();
    }}
    onmousedown={(e) => {
        e.preventDefault();
        e.stopPropagation();
    }}
    role="none">
    {#if listPrepend}{@render listPrepend()}{/if}
    {#if listOverride}{@render listOverride(filteredItems)}
    {:else if filteredItems.length > 0}
        {#each filteredItems as item, i}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_mouse_events_have_key_events -->
            <div
                onmouseover={() => handleHover(i)}
                onfocus={() => handleHover(i)}
                onclick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item, i);
                }}
                onkeydown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                class="list-item"
                tabindex="-1"
                role="none"
                use:scrollAction={{ active: isItemActive(item), hover: hoverItemIndex === i }}>
                <Item
                    {item}
                    index={i}
                    {label}
                    isActive={isItemActive(item)}
                    isHover={hoverItemIndex === i}
                    isFirst={i === 0}
                    isGroupHeader={item.groupHeader}
                    isGroupItem={item.groupItem}
                    isSelectable={item?.selectable !== false}
                    content={itemSnippet} />
            </div>
        {/each}
    {:else if !hideEmptyState}
        {#if empty}{@render empty()}{:else}<div class="empty">No options</div>{/if}
    {/if}
    {#if listAppend}{@render listAppend()}{/if}
</div>

<style>
    .svelte-select-list {
        box-shadow: var(--list-shadow, 0 2px 3px 0 rgba(44, 62, 80, 0.24));
        border-radius: var(--list-border-radius, 4px);
        max-height: var(--list-max-height, 252px);
        overflow-y: auto;
        background: var(--list-background, #fff);
        position: var(--list-position, absolute);
        z-index: var(--list-z-index, 2);
        border: var(--list-border);
    }

    .prefloat {
        opacity: 0;
        pointer-events: none;
    }

    .empty {
        text-align: var(--list-empty-text-align, center);
        padding: var(--list-empty-padding, 20px 0);
        color: var(--list-empty-color, #78848f);
    }
</style>
