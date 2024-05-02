<script lang="ts">
	import { prvIcon } from '$lib/components/icons';
	import { pubIcon } from '$lib/components/icons';
	import { nowProgress } from '$lib/stores/settings';
	export let handleClickPub;
	export let parent;
</script>

<button
	class="btn variant-filled-primary {parent.buttonPositive} px-2 fill-white"
	on:click={handleClickPub}
	disabled={$nowProgress}>{@html pubIcon}Public</button
>
