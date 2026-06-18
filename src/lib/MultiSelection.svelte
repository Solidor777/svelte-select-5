<script>
    import ClearIcon from './ClearIcon.svelte';

    let {
        value,
        label = 'label',
        disabled = false,
        multiFullItemClearable = false,
        activeValue,
        onclear,
        selection,
        multiClearIcon,
    } = $props();
</script>

{#each value as item, i}
    <div
        class="multi-item"
        class:active={activeValue === i}
        class:disabled
        onclick={(e) => {
            e.preventDefault();
            if (multiFullItemClearable) onclear?.(i);
        }}
        onkeydown={(e) => {
            e.preventDefault();
            e.stopPropagation();
        }}
        role="none">
        <span class="multi-item-text">
            {#if selection}{@render selection(item, i)}{:else}{item[label]}{/if}
        </span>

        {#if !disabled && !multiFullItemClearable}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="multi-item-clear"
                onpointerup={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onclear?.(i);
                }}>
                {#if multiClearIcon}{@render multiClearIcon()}{:else}<ClearIcon />{/if}
            </div>
        {/if}
    </div>
{/each}

<style>
    .multi-item {
        background: var(--svelte-select-chip-bg);
        margin: var(--svelte-select-chip-margin);
        outline: var(--svelte-select-chip-outline);
        border-radius: var(--svelte-select-chip-radius);
        height: var(--svelte-select-chip-height);
        line-height: var(--svelte-select-chip-height);
        display: flex;
        cursor: default;
        padding: var(--svelte-select-chip-padding);
        overflow: hidden;
        gap: var(--svelte-select-chip-gap);
        outline-offset: -1px;
        max-width: var(--svelte-select-chip-max-width);
        color: var(--svelte-select-chip-color);
    }

    .multi-item.disabled:hover {
        background: var(--svelte-select-chip-disabled-bg);
        color: var(--svelte-select-chip-disabled-color);
    }

    .multi-item-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .multi-item-clear {
        display: flex;
        align-items: center;
        justify-content: center;
        --svelte-select-clear-icon-color: var(--svelte-select-chip-clear-color);
    }

    .multi-item.active {
        outline: var(--svelte-select-chip-active-outline);
    }
</style>
