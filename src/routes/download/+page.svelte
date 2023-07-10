<script lang='ts'>
    export let data
    let t0 = new Date()
    let t1 = new Date()
    $: t1 = t0
</script>

<form method="post">
    <select name="id" id="id">
        {#each data.cameras as camera}
            <option value={camera.id}>{camera.name}</option>
        {/each}
    </select>
    <input type="datetime-local" step="1" name="t0" id="t0" bind:value={t0}>
    <input type="datetime-local" step="1" name="t1" id="t1" bind:value={t1}>
    <button>Run</button>
</form>