<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';

	import { identifierList, listNum } from '$lib/stores/bookmarkEvents';

	export let parent: any;

	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response(res);

		modalStore.close();
	}
	// Form Data
	let res: { title?: string; image?: string; summary?: string } = {
		title: $identifierList[$listNum].title ?? '',
		image: $identifierList[$listNum].image ?? '',
		summary: $identifierList[$listNum].summary ?? ''
	};
	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
		<article class="body">{$modalStore[0].body ?? '(body missing)'}</article>
		<!-- Enable for debugging: -->

		<div class=" ">
			<label class="label mt-2">
				<span>title</span>
				<input
					class="input p-2"
					type="text"
					bind:value={res.title}
					placeholder="Books"
				/>
			</label>

			<label class="label mt-2">
				<span>image</span>
				<input
					class="input p-2"
					type="text"
					bind:value={res.image}
					placeholder="https://example.com/image.webp"
				/>
			</label>
			<img class="max-h-24 m-2" src={res.image} alt="" />
			<label class="label mt-2">
				<span>summary</span>
				<textarea
					class="input p-2 max-h-24 overflow-y-auto break-all"
					bind:value={res.summary}
					placeholder="Recommended Books Collection"
				/>
			</label>
		</div>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
        
        <button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Update</button>
       
    </footer>
	</div>
{/if}
