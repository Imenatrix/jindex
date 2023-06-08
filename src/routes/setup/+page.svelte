<script>
    import { enhance } from "$app/forms"

    let creating = false
    let done = false
</script>

<div class="w-screen h-screen flex justify-center items-center">
    <div class="card bg-base-200">
        <form class="card-body text-center" action="?/setup" method='post' use:enhance={() => {
            creating = true
            return async ({ update }) => {
                await update()
                done = true
                creating = false
            }
        }}>
        {#if creating}
            <div class="loading loading-spinner"></div>
        {:else if done}
            <div class="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Pronto!</span>
            </div>
        {:else}
            <div class="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Clique para fazer o setup do projeto</span>
            </div>
        {/if}
            <button class="btn btn-primary">Setup</button>
        </form>
        
    </div>
</div>