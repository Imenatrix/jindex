<script>
	import CameraForm from "$lib/components/CameraForm.svelte";
	import CameraList from "$lib/components/CameraList.svelte";

</script>
<div class="flex space-x-3 h-screen p-3">
    <div class="flex flex-col flex-1 space-y-3">
        <div class="card bg-base-200">
            <CameraForm action="?/create"/>
        </div>
        <div class="card bg-base-200 flex-1">
            <div></div>
        </div>
    </div>
    <div class="card bg-base-200 flex-[2]">
        <CameraList start="?/start" stop="?/stop" destroy="?/delete"/>
    </div>
</div>
