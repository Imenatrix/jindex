<script lang='ts'>
	import { getEmbed } from '$lib/embed';
    import '$lib/firebase'
	import { collection, getDocs, getFirestore, query, where, QuerySnapshot } from 'firebase/firestore';
    import type { DocumentData } from 'firebase/firestore'
	import { onMount } from 'svelte';

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
                                <form method='post' action="?/stop">
                                    <input type="hidden" name="id" value={camera.id}>
                                    <button class="btn btn-success">Ativa</button>
                                </form>
                            {:else if camera.data().status == 'STOPPED'}
                                <form method='post' action="?/activate">
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
                    </tr>
                {/each}
            {/await}
        {/if}
    </tbody>
</table>