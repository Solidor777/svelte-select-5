<script>
    import Select from '../../../../src/lib/Select.svelte';
    let { items = [] } = $props();
</script>

<Select {items} listOpen focused name="food">
    {#snippet list(filteredItems)}
        <div class="snip-list">custom list with {filteredItems.length} items</div>
    {/snippet}
    {#snippet inputHidden(value)}
        <input type="hidden" class="snip-hidden" value={value ? 'has-value' : 'no-value'} />
    {/snippet}
</Select>
