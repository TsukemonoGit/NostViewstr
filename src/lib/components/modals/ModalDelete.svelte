<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';
	export let parent: any;

	let response: boolean = false;

	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response(response);
		modalStore.close();
	}
	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>
			{$modalStore[0].title ?? '(title missing)'}
		</header>
		<article class="body">
			{$modalStore[0].body ?? '(body missing)'}
		</article>

		{#if $modalStore[0].value.event}
			<div class="card p-2 max-h-56 overflow-y-auto">
				{#each $modalStore[0].value.event as e, index}
					<div class="card flex p-2 m-1 break-all">
						<div>{index + 1}.</div>
						<div class=" ml-2">
							{e.content !== '' ? e.content : $_('modal.deleteNote.content')}
						</div>
					</div>
				{/each}
			</div>
		{:else if $modalStore[0].value.tag}
			<div class="card flex p-2 m-1 break-all">
				<b>{$modalStore[0].value.tag}</b>
			</div>
		{/if}

		<footer class=" rid grid-cols-3 gap-2 flex justify-end mt-2">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{parent.buttonTextCancel}</button
			>
			<button
				class="btn variant-filled-warning {parent.buttonPositive}"
				on:click={() => {
					response = true;
					onFormSubmit();
				}}>Delete</button
			>
		</footer>
	</div>
{/if}
