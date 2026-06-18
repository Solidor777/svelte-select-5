<script>
    import Select from '$lib/Select.svelte';

    let items = [
        { value: 'one', label: 'One' },
        { value: 'two', label: 'Two' },
        { value: 'three', label: 'Three' },
    ];

    function handle(filtered) {
        console.log(filtered);
    }
</script>

<Select {items} onfilter={handle} />

