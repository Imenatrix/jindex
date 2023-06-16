<script lang='ts'>
    import '$lib/firebase'
	import { onMount } from 'svelte';
	import { getEmbed } from '$lib/embed';
    import type { DocumentData } from 'firebase/firestore'
	import { collection, getDocs, getFirestore, QuerySnapshot } from 'firebase/firestore';

    let cameras : Promise<QuerySnapshot<DocumentData>>

    let hint = false

    onMount(async () => {
        const db = getFirestore()
        const col = collection(db, 'cameras')
        cameras = getDocs(col)
    })

    function copy(text : string) {
        navigator.clipboard.writeText(text)
        hint = true
    }

    export let start : string
    export let stop : string
    export let destroy : string
</script>

<table class="table">
    <thead>
        <tr>
            <th>Status</th>
            <th>Nome</th>
            <th>Input URL</th>
            <th>Stream URL</th>
            <th>Embed</th>
        </tr>
    </thead>
    <tbody>
        {#if cameras != undefined}
            {#await cameras}
                <div class="loading loading-spinner"></div>
            {:then { docs }}
                {#each docs as camera}
                    <tr>
                        <td>
                            {#if camera.data().status == 'CREATING'}
                                <div class="btn btn-info">Criando...</div>
                            {:else if camera.data().status == 'ACTIVE'}
                                <form method='post' action={stop}>
                                    <input type="hidden" name="id" value={camera.id}>
                                    <button class="btn btn-success">Ativa</button>
                                </form>
                            {:else if camera.data().status == 'STOPPED'}
                                <form method='post' action={start}>
                                    <input type="hidden" name="id" value={camera.id}>
                                    <button class="btn btn-warning">Parada</button>
                                </form>
                            {/if}
                        </td>
                        <td>{camera.data().name}</td>
                        <td>{camera.data().input_uri}</td>
                        <td>{camera.data().output_uri}</td>
                        <td class="tooltip" data-tip={hint ? 'Copiar' : 'Copiado!'} on:dragleave={() => hint = false}>
                            <button class='btn btn-primary' on:click={() => copy(getEmbed(camera.data().output_uri))}>{'</>'}</button>
                        </td>
                        <td>
                            <form method='post' action={destroy}>
                                <input type="hidden" name="id" value={camera.id}>
                                <button class="btn btn-error btn-square text-white">X</button>
                            </form>
                        </td>
                    </tr>
                {/each}
            {/await}
        {/if}
    </tbody>
</table>
