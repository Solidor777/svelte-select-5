<script>
    import Select from '$lib/Select.svelte';

    let items = ['One', 'Two', 'Three'];
    let listOpen = $state(false);
</script>

<!-- New --svelte-select-* tokens, plus a legacy var (--border-radius, still honored). -->
<Select
    bind:listOpen
    {items}
    listOffset={0}
    --svelte-select-list-radius="0 0 5px 5px"
    --svelte-select-item-first-radius="0"
    --svelte-select-accent="rebeccapurple"
    --border-radius={listOpen ? '5px 5px 0 0' : '5px'} />
