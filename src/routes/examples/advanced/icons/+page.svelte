<script>
    import Select from '$lib/Select.svelte';

    // Each item carries its own icon. Here the icon is just text inside an <i>
    // (emoji, so the demo is self-contained); with an icon font you'd instead do
    // `<i class={option.icon}></i>` and store class names like 'fa-solid fa-pen'.
    const items = [
        { value: 'edit', label: 'Edit', icon: '✏️' },
        { value: 'copy', label: 'Copy', icon: '📋' },
        { value: 'share', label: 'Share', icon: '🔗' },
        { value: 'delete', label: 'Delete', icon: '🗑️' },
    ];

    let value = $state(null);
</script>

<Select {items} bind:value placeholder="Pick an action…">
    <!-- icon + label for each option in the list -->
    {#snippet item(option)}
        <span class="opt"><i class="ico">{option.icon}</i> {option.label}</span>
    {/snippet}

    <!-- icon + label for the selected value too -->
    {#snippet selection(selected)}
        <span class="opt"><i class="ico">{selected.icon}</i> {selected.label}</span>
    {/snippet}
</Select>

<style>
    .opt {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    .ico {
        font-style: normal;
        width: 1.25em;
        text-align: center;
    }
</style>
