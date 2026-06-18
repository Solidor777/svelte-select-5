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
        background: var(--multi-item-bg, #ebedef);
        margin: var(--multi-item-margin, 0);
        outline: var(--multi-item-outline, 1px solid #ddd);
        border-radius: var(--multi-item-border-radius, 4px);
        height: var(--multi-item-height, 25px);
        line-height: var(--multi-item-height, 25px);
        display: flex;
        cursor: default;
        padding: var(--multi-item-padding, 0 5px);
        overflow: hidden;
        gap: var(--multi-item-gap, 4px);
        outline-offset: -1px;
        max-width: var(--multi-max-width, none);
        color: var(--multi-item-color, var(--item-color));
    }

    .multi-item.disabled:hover {
        background: var(--multi-item-disabled-hover-bg, #ebedef);
        color: var(--multi-item-disabled-hover-color, #c1c6cc);
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
        --clear-icon-color: var(--multi-item-clear-icon-color, #000);
    }

    .multi-item.active {
        outline: var(--multi-item-active-outline, 1px solid #006fe8);
    }
</style>
