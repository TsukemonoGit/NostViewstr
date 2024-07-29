<script lang="ts">
	import { nowProgress } from '$lib/stores/settings';
	export let handleClickPub;
	export let parent;
</script>

<button
	class="btn variant-filled-primary {parent.buttonPositive}"
	on:click={handleClickPub}
	disabled={$nowProgress}>SAVE</button
>
