<script>
    import Select from '$lib/Select.svelte';

    const items = [
        { value: 'chocolate', label: 'Chocolate', group: 'Sweet' },
        { value: 'cake', label: 'Cake', group: 'Sweet' },
        { value: 'ice-cream', label: 'Ice Cream', group: 'Sweet' },
        { value: 'pizza', label: 'Pizza', group: 'Savory' },
        { value: 'chips', label: 'Chips', group: 'Savory' },
    ];

    let value = $state(null);
    let multiple = $state(false);
    let dark = $state(false);
    let lastEvent = $state('—');
</script>

<div class="controls">
    <label><input type="checkbox" bind:checked={multiple} /> multiple</label>
    <label><input type="checkbox" bind:checked={dark} /> dark</label>
</div>

<div data-theme={dark ? 'dark' : null}>
    <Select
        {items}
        {multiple}
        bind:value
        groupBy={(item) => item.group}
        placeholder="Pick a food…"
        showChevron
        --svelte-select-accent="rebeccapurple"
        onchange={(v) => (lastEvent = `change: ${JSON.stringify(v)}`)}
        onselect={(s) => (lastEvent = `select: ${s.label}`)}
        onclear={() => (lastEvent = 'clear')}>
        {#snippet prepend()}
            <span class="prepend" aria-hidden="true">🍽️</span>
        {/snippet}
        {#snippet item(item)}
            <span class="item">{item.label} <small>({item.group})</small></span>
        {/snippet}
        {#snippet empty()}
            <div class="empty">Nothing matches</div>
        {/snippet}
    </Select>
</div>

<p>value: {value ? JSON.stringify(value) : 'null'}</p>
<p>last event: {lastEvent}</p>

<style>
    .controls {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;
    }
    .prepend {
        display: flex;
        align-items: center;
        padding-left: 8px;
    }
    .item small {
        opacity: 0.6;
    }
    .empty {
        padding: 20px;
        text-align: center;
        opacity: 0.7;
    }
</style>
