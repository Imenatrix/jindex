<script lang='ts'>
    import '$lib/firebase'
	import { collection, getDocs, getFirestore, query, where, QuerySnapshot } from 'firebase/firestore';
    import type { DocumentData } from 'firebase/firestore'
	import { onMount } from 'svelte';

    let cameras : Promise<QuerySnapshot<DocumentData>>;

    onMount(async () => {
        const db = getFirestore()
        const col = collection(db, 'cameras')
        cameras = getDocs(col)
    })
</script>

<table class="table">
    <thead>
        <tr>
            <th>Nome</th>
            <th>Input URL</th>
            <th>Stream URL</th>
        </tr>
    </thead>
    <tbody>
        {#if cameras != undefined}
            {#await cameras}
                <div class="loading loading-spinner"></div>
            {:then { docs }} 
                {#each docs as camera}
                    <tr>
                        <td>{camera.data().name}</td>
                        <td>{camera.data().input_uri}</td>
                        <td>{camera.data().output_uri}</td>
                    </tr>
                {/each}
            {/await}
        {/if}
    </tbody>
</table>