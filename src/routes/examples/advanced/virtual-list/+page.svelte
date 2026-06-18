<script>
    import Select from '$lib/Select.svelte';

    const items = Array.from({ length: 8000 }, (_, i) => ({ value: i, label: `Item ${i}` }));

    const ROW = 40;
    const VISIBLE = 8;

    let value = $state(null);
    let listOpen = $state(false);
    let scrollTop = $state(0);

    function pick(item) {
        value = item;
        listOpen = false;
    }
</script>

<!-- Windowed list via the `list` snippet: only the visible rows are rendered,
     so 8000 items stay performant without a virtual-list dependency. -->
<Select {items} bind:value bind:listOpen>
    {#snippet list(filteredItems)}
        {@const start = Math.max(0, Math.floor(scrollTop / ROW) - 2)}
        {@const end = Math.min(filteredItems.length, start + VISIBLE + 4)}
        <div
            class="vlist"
            style="height: {VISIBLE * ROW}px; overflow-y: auto;"
            onscroll={(e) => (scrollTop = e.currentTarget.scrollTop)}>
            <div style="height: {filteredItems.length * ROW}px; position: relative;">
                {#each filteredItems.slice(start, end) as item, i (item.value)}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class="vrow"
                        class:selected={value && value.value === item.value}
                        style="position: absolute; top: {(start + i) * ROW}px; height: {ROW}px;"
                        onclick={() => pick(item)}>
                        {item.label}
                    </div>
                {/each}
            </div>
        </div>
    {/snippet}
</Select>

<style>
    .vrow {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0 20px;
        cursor: default;
        box-sizing: border-box;
    }
    .vrow:hover {
        background: var(--svelte-select-accent-subtle);
    }
    .vrow.selected {
        background: var(--svelte-select-accent);
        color: var(--svelte-select-accent-text);
    }
</style>
