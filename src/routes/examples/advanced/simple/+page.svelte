<script>
    import Select from '$lib/Select.svelte';

    const items = ['One', 'Two', 'Three', 'Four', 'Five'];
    let value = $state(null);
</script>

<Select {items} bind:value />

<p>Selected: {value ? JSON.stringify(value) : 'nothing'}</p>
