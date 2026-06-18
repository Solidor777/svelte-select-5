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
        height: var(--item-height, var(--height, 42px));
        line-height: var(--item-line-height, var(--height, 42px));
        padding: var(--item-padding, 0 20px);
        color: var(--item-color, inherit);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        transition: var(--item-transition, all 0.2s);
        align-items: center;
        width: 100%;
    }

    .item.group-item {
        padding-left: var(--group-item-padding-left, 40px);
    }

    .item:active {
        background: var(--item-active-background, #b9daff);
    }

    .item.active {
        background: var(--item-is-active-bg, #007aff);
        color: var(--item-is-active-color, #fff);
    }

    .item.first {
        border-radius: var(--item-first-border-radius, 4px 4px 0 0);
    }

    .item.hover:not(.active) {
        background: var(--item-hover-bg, #e7f2ff);
        color: var(--item-hover-color, inherit);
    }

    .item.not-selectable,
    .item.hover.item.not-selectable,
    .item.active.item.not-selectable,
    .item.not-selectable:active {
        color: var(--item-is-not-selectable-color, #999);
        background: transparent;
    }

    .list-group-title {
        color: var(--group-title-color, #8f8f8f);
        cursor: default;
        font-size: var(--group-title-font-size, 16px);
        font-weight: var(--group-title-font-weight, 600);
        height: var(--height, 42px);
        line-height: var(--height, 42px);
        padding: var(--group-title-padding, 0 20px);
        text-overflow: ellipsis;
        overflow-x: hidden;
        white-space: nowrap;
        text-transform: var(--group-title-text-transform, uppercase);
        border-width: var(--group-title-border-width, medium);
        border-style: var(--group-title-border-style, none);
        border-color: var(--group-title-border-color, color);
    }
</style>
