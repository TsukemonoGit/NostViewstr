<script lang="ts">
	import { prvIcon } from '$lib/components/icons';
	import { pubIcon } from '$lib/components/icons';
	import { nowProgress } from '$lib/stores/settings';
	export let handleClickPrv;
	export let parent;
</script>

<button
	class="btn variant-filled-warning px-2 {parent.buttonPositive}"
	on:click={handleClickPrv}
	disabled={$nowProgress}>{@html prvIcon} Private</button
>
