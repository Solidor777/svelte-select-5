<script>
    let {
        item,
        index,
        label = 'label',
        isActive = false,
        isHover = false,
        isFirst = false,
        isGroupHeader = false,
        isGroupItem = false,
        isSelectable = true,
        content,
    } = $props();
</script>

<div
    class="item"
    class:list-group-title={isGroupHeader}
    class:active={isActive}
    class:first={isFirst}
    class:hover={isHover}
    class:group-item={isGroupItem}
    class:not-selectable={!isSelectable}>
    {#if content}{@render content(item, index)}{:else}{item?.[label]}{/if}
</div>

<style>
    .item {
        cursor: default;
        height: var(--svelte-select-item-height);
        line-height: var(--svelte-select-item-line-height);
        padding: var(--svelte-select-item-padding);
        color: var(--svelte-select-item-color);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        transition: var(--svelte-select-item-transition);
        align-items: center;
        width: 100%;
    }

    .item.group-item {
        padding-left: var(--svelte-select-group-item-padding-left);
    }

    .item:active {
        background: var(--svelte-select-item-pressed-bg);
    }

    .item.active {
        background: var(--svelte-select-item-active-bg);
        color: var(--svelte-select-item-active-color);
    }

    .item.first {
        border-radius: var(--svelte-select-item-first-radius);
    }

    .item.hover:not(.active) {
        background: var(--svelte-select-item-hover-bg);
        color: var(--svelte-select-item-hover-color);
    }

    .item.not-selectable,
    .item.hover.item.not-selectable,
    .item.active.item.not-selectable,
    .item.not-selectable:active {
        color: var(--svelte-select-item-not-selectable-color);
        background: transparent;
    }

    .list-group-title {
        color: var(--svelte-select-group-title-color);
        cursor: default;
        font-size: var(--svelte-select-group-title-font-size);
        font-weight: var(--svelte-select-group-title-font-weight);
        height: var(--svelte-select-item-height);
        line-height: var(--svelte-select-item-height);
        padding: var(--svelte-select-group-title-padding);
        text-overflow: ellipsis;
        overflow-x: hidden;
        white-space: nowrap;
        text-transform: var(--svelte-select-group-title-text-transform);
        border-width: var(--svelte-select-group-title-border-width);
        border-style: var(--svelte-select-group-title-border-style);
        border-color: var(--svelte-select-group-title-border-color);
    }
</style>
