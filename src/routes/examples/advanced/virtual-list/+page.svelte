<script>
    import Select from '$lib/Select.svelte';

    const items = [];
    for (let i = 0; i < 8000; i++) {
        items.push(i.toString());
    }
</script>

<!-- Virtual-list example pending rework to the Svelte 5 snippet API (see docs/TODO.md). -->
<p>Virtual list example is being reworked for the Svelte 5 list snippet API.</p>

<Select --list-max-height="300px" {items} />
