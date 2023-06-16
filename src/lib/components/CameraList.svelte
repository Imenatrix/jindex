<script lang='ts'>
    import '$lib/firebase'
	import { onMount } from 'svelte';
	import { getEmbed } from '$lib/embed';
    import { onSnapshot, type DocumentData, query } from 'firebase/firestore'
	import { collection, getFirestore, QuerySnapshot } from 'firebase/firestore';
	import { enhance } from '$app/forms';

    let cameras : QuerySnapshot<DocumentData>

    let hint = true

    onMount(async () => {
        const db = getFirestore()
        const col = collection(db, 'cameras')
        onSnapshot(query(col), (querySnapshot) => {
            cameras = querySnapshot
        })
    })

    function copy(text : string) {
        navigator.clipboard.writeText(text)
        hint = false
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
            {#each cameras.docs as camera}
                <tr>
                    <td>
                        {#if ['ACTIVATING', 'STOPPING'].includes(camera.data().status)}
                            <div class="btn btn-info">
                                <div class="loading loading-spinner"></div>
                            </div>
                        {:else if camera.data().status == 'CREATING'}
                            <div class="btn btn-info">Criando...</div>
                        {:else if camera.data().status == 'ACTIVE'}
                            <form method='post' action={stop} use:enhance>
                                <input type="hidden" name="id" value={camera.id}>
                                <button class="btn btn-success">Ativa</button>
                            </form>
                        {:else if camera.data().status == 'STOPPED'}
                            <form method='post' action={start} use:enhance>
                                <input type="hidden" name="id" value={camera.id}>
                                <button class="btn btn-warning">Parada</button>
                            </form>
                        {/if}
                    </td>
                    <td>{camera.data().name}</td>
                    <td>{camera.data().input_uri}</td>
                    <td>{camera.data().output_uri}</td>
                    <td class="tooltip" data-tip={hint ? 'Copiar' : 'Copiado!'} on:pointerleave={() => hint = true}>
                        <button class='btn btn-primary' on:click={() => copy(getEmbed(camera.data().output_uri))}>{'</>'}</button>
                    </td>
                    <td>
                        {#if camera.data().status == 'DELETING'}
                        <div class="btn btn-error btn-square text-white">
                            <div class="loading loading-spinner"></div>
                        </div>
                        {:else}
                            <form method='post' action={destroy} use:enhance>
                                <input type="hidden" name="id" value={camera.id}>
                                <button class="btn btn-error btn-square text-white">X</button>
                            </form>
                        {/if}
                    </td>
                </tr>
            {/each}
        {/if}
    </tbody>
</table>
