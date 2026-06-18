<script>
    let { value, label = 'label', hideSelectedItem = false, selection } = $props();
</script>

<div class="selected-item" class:hide-selected-item={hideSelectedItem}>
    {#if selection}{@render selection(value)}{:else}{value[label]}{/if}
</div>

<style>
    .selected-item {
        position: relative;
        overflow: var(--selected-item-overflow, hidden);
        padding: var(--selected-item-padding, 0 20px 0 0);
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--selected-item-color, inherit);
        font-size: var(--font-size, 16px);
    }

    .selected-item:focus {
        outline: none;
    }

    .hide-selected-item {
        opacity: 0;
    }
</style>
