<script>
    let { value, label = 'label', hideSelectedItem = false, selection } = $props();
</script>

<div class="selected-item" class:hide-selected-item={hideSelectedItem}>
    {#if selection}{@render selection(value)}{:else}{value[label]}{/if}
</div>

<style>
    .selected-item {
        position: relative;
        overflow: var(--svelte-select-selected-overflow);
        padding: var(--svelte-select-selected-padding);
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--svelte-select-selected-color);
        font-size: var(--svelte-select-control-font-size);
    }

    .selected-item:focus {
        outline: none;
    }

    .hide-selected-item {
        opacity: 0;
    }
</style>
