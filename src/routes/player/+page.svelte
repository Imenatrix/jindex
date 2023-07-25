<script lang='ts'>
    import '$lib/firebase'
    import { onMount } from "svelte"
	import { initVideoPlayer, setCamera } from "./wrapper"
	import { collection, getDocs, getFirestore } from "firebase/firestore";
    let player : Element

    let cameras : Promise<any>
    let camera : string = ''
    let app : any

    let downloading = false

    onMount(() => {
        const db = getFirestore()
        cameras = getDocs(collection(db, 'cameras')).then(snapshots => snapshots.docs.map(doc => ({id : doc.id, ...doc.data()})))
    })

    function handleChange() {
        if (app == undefined && camera != '') {
            app = initVideoPlayer(player)
        }
        if (camera != '') {
            setCamera(app, camera)
        }
    }

    let t0 = new Date()
    let t1 = new Date()
    $: t1 = t0

    async function handleSubmit() {
        downloading = true
        const response = await fetch('/download', {
            method: 'POST',
            body: JSON.stringify({
                id : camera,
                t0 : t0.toISOString(),
                t1 : t1.toISOString()
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
        downloading = false
    }
</script>

<div class='p-4 space-y-4'>
    {#if cameras != undefined}
        {#await cameras}
            <div class="loading loading-spinner"></div>
        {:then cameras}
            <div class="card p-4 bg-base-200 flex-row">
                <label class='space-x-2' for="camera">
                    Camera:
                    <select id="camera" bind:value={camera} class="input" on:change={handleChange}>
                        {#each cameras as camera}
                            <option value={camera.id}>{camera.name}</option>
                        {/each}
                    </select>
                </label>
                <div class='flex-1'></div>
                <form class='space-x-2' on:submit={handleSubmit}>
                    <button class="btn btn-primary">
                        {#if downloading}
                            <div class="loading loading-spinner"></div>
                        {:else}
                            Download
                        {/if}
                    </button>
                    <input class="input" type="datetime-local" step="1" name="t0" id="t0" bind:value={t0}>
                    <input class="input" type="datetime-local" step="1" name="t1" id="t1" bind:value={t1}>
                </form>
            </div>
        {/await}
    {/if}
    {#if camera != ''}
        <div bind:this={player} class="video-player"></div>
    {/if}
</div>

