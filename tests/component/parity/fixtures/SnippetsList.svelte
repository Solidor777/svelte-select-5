<script>
    import Select from '../../../../src/lib/Select.svelte';
    let { items = [], showChevron = false } = $props();
</script>

<Select {items} listOpen focused {showChevron}>
    {#snippet prepend()}<span class="snip-prepend">PRE</span>{/snippet}
    {#snippet item(it)}<span class="snip-item">I:{it.label}</span>{/snippet}
    {#snippet empty()}<div class="snip-empty">NOTHING HERE</div>{/snippet}
    {#snippet listPrepend()}<div class="snip-lp">LP</div>{/snippet}
    {#snippet listAppend()}<div class="snip-la">LA</div>{/snippet}
    {#snippet chevronIcon()}<span class="snip-chevron">CHV</span>{/snippet}
</Select>
