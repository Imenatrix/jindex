<script lang='ts'>
    import { enhance } from "$app/forms"
    let creating = false
</script>

<div class="flex justify-center items-center h-screen w-screen">
    <div class="card w-96 bg-base-200">
        <form method="post" action='?/create' class="card-body" use:enhance={() => {
            creating = true
            return async ({ update }) => {
                creating = false
                await update()
            }
        }}>
            <input type="text" name="name" placeholder="Nome..." class="input">
            <button class="btn btn-primary">
                {#if creating}
                    <div class="loading loading-spinner"></div>
                {:else}
                    Create
                {/if}
            </button>
        </form>
    </div>
</div>