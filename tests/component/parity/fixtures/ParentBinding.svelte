<script>
    import Select from '../../../../src/lib/Select.svelte';
    let { items = [] } = $props();
    let value = $state(null);
</script>

<Select {items} listOpen focused bind:value />
<div class="result">{value ? value.label : 'none'}</div>
