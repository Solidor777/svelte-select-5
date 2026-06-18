<script>
    import Select from '../../../../src/lib/Select.svelte';
    let { items = [], value = null, multiple = false } = $props();
</script>

<Select {items} {value} {multiple}>
    {#snippet selection(sel)}<span class="snip-selection">S:{sel.label}</span>{/snippet}
    {#snippet clearIcon()}<span class="snip-clear">CLR</span>{/snippet}
    {#snippet multiClearIcon()}<span class="snip-multiclear">MX</span>{/snippet}
</Select>
