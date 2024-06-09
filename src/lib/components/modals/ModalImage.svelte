<script lang="ts">
	import { modalStore } from '$lib/stores/store';
	export let parent: any;
	// Base Classes
	const cBase = 'card p-4  shadow-xl space-y-4 break-all';

	function handleClickImage() {
		window.open($modalStore[0]?.image, '_blank');
	}
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<img
			loading="lazy"
			src={$modalStore[0]?.image}
			alt=""
			on:click={handleClickImage}
		/>

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{parent.buttonTextCancel}</button
			>
		</footer>
	</div>
{/if}

<style>
	img {
		max-height: 80vh;
		max-width: 80vw;
	}
</style>
