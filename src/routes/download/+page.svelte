<script lang='ts'>
    export let data
    let t0 = new Date()
    let t1 = new Date()
    let id = data.cameras[0].id
    $: t1 = t0

    async function handleSubmit() {
        const response = await fetch('/download', {
            method: 'POST',
            body: JSON.stringify({
                id : id,
                t0 : t0,
                t1 : t1
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "video.mp4";
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();    
        a.remove();  
    }
</script>

<form on:submit={handleSubmit}>
    <select name="id" id="id" bind:value={id}>
        {#each data.cameras as camera}
            <option value={camera.id}>{camera.name}</option>
        {/each}
    </select>
    <input type="datetime-local" step="1" name="t0" id="t0" bind:value={t0}>
    <input type="datetime-local" step="1" name="t1" id="t1" bind:value={t1}>
    <button>Run</button>
</form>