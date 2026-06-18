<script>
    import Select from '$lib/Select.svelte';

    const items = [
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'pizza', label: 'Pizza' },
        { value: 'cake', label: 'Cake' },
        { value: 'chips', label: 'Chips' },
        { value: 'ice-cream', label: 'Ice Cream' },
    ];
</script>

<div style="padding: 60px; display: flex; flex-direction: column; gap: 40px; max-width: 320px;">
    <div data-test="basic">
        <Select {items} />
    </div>

    <div data-test="auto-width">
        <Select {items} listAutoWidth={false} />
    </div>

    <div data-test="item-height" style="--item-height: 80px;">
        <Select {items} />
    </div>

    <div data-test="first">
        <Select {items} />
    </div>
    <div data-test="second" style="margin-top: 320px;">
        <Select {items} />
    </div>

    <div data-test="dark" data-theme="dark">
        <Select {items} />
    </div>
</div>
