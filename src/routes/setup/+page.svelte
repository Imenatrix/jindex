<script>
    import { enhance } from "$app/forms"

    let creating = false
    let done = false
</script>

<form action="?/setup" method='post' use:enhance={() => {
    creating = true
    return async ({ update }) => {
        await update()
        done = true
        creating = false
    }
}}>
    <button>Setup</button>
</form>

{#if creating}
    <p>Creating...</p>
{/if}
{#if done}
    <p>Done!</p>
{/if}