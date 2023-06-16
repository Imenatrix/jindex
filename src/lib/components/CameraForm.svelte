<script lang='ts'>
    import { enhance } from "$app/forms"
    let creating = false

    let protocol = 'RTMP'
    export let action : string
</script>


<form method="post" {action} class="card-body" use:enhance={() => {
    creating = true
    return async ({ update }) => {
        creating = false
        await update()
    }
}}>
    <input type="text" name="name" placeholder="Nome..." class="input">
    <select bind:value={protocol} class="select" name="protocol">
        <option value="RTMP">RTMP</option>
        <option value="RTSP">RTSP</option>
    </select>
    {#if protocol == 'RTSP'}
        <input type="text" class="input" placeholder="URL..." name="url">
    {/if}
    <button class="btn btn-primary">
        {#if creating}
            <div class="loading loading-spinner"></div>
        {:else}
            Create
        {/if}
    </button>
</form>
