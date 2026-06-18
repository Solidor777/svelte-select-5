<script>
    import Select from '$lib/Select.svelte';

    let items = [
        { value: 'one', label: 'One' },
        { value: 'two', label: 'Two' },
        { value: 'three', label: 'Three' },
    ];

    let value = $state([]);
    let checked = $state([]);
    let isChecked = $state({});

    $effect(() => {
        computeValue();
        computeIsChecked();
    });

    function computeIsChecked() {
        isChecked = {};
        checked.forEach((c) => (isChecked[c] = true));
    }

    function computeValue() {
        value = checked.map((c) => items.find((i) => i.value === c));
    }

    function handleSelect(selection) {
        checked.includes(selection.value)
            ? (checked = checked.filter((i) => i != selection.value))
            : (checked = [...checked, selection.value]);
    }

    function handleClear(removed) {
        if (Array.isArray(removed)) checked = [];
    }
</script>

<Select
    {items}
    {value}
    multiple={true}
    filterSelectedItems={false}
    closeListOnChange={false}
    onselect={handleSelect}
    onclear={handleClear}>
    {#snippet item(item)}
        <div class="item">
            <label for={item.value}>
                <input type="checkbox" id={item.value} bind:checked={isChecked[item.value]} />
                {item.label}
            </label>
        </div>
    {/snippet}
</Select>

<style>
    .item {
        pointer-events: none;
    }
</style>
