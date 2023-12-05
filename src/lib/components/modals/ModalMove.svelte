<script lang="ts">
	import { identifierList } from '$lib/stores/bookmarkEvents';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';

	// Props
	/** Exposes parent props to this component. */
	export let parent: any;
	// Local
	let res = { tag: 0, bkm: '' };

	let selectTag = 0;

	$: pubkey = $modalStore[0]?.value?.pubkey;
	$: kind = $modalStore[0]?.value?.kind;

	//$: moveList = $tags.filter((item) => item !== $tags[$tabSet]);
	// Handle Form Submission
	function onFormSubmit(): void {
		res.tag = selectTag;
		console.log(selectTag);
		if ($modalStore[0].response) {
			$modalStore[0].response(res);
		}
		console.log(res);
		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4 break-all';
	const cHeader = 'text-2xl font-bold';

	function onChange(list: string) {
		console.log(list);
		console.log(selectTag);
	}
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>
			{$modalStore[0].title ?? '(title missing)'}
		</header>
		<article>{$modalStore[0].body ?? '(body missing)'}</article>

		<ListBox
			class="border border-surface-500 p-4 rounded-container-token max-h-56 overflow-auto"
			>{#if $identifierList[pubkey][kind].length > 0}
				{#each $identifierList[pubkey][kind] as list, index}
					<ListBoxItem
						bind:group={selectTag}
						name={list.identifier ?? ''}
						value={index}
						class="truncate"
						on:change={() => onChange(list.identifier ?? '')}
						>{list.identifier}
						{list.title ? `【${list.title}】` : ''}</ListBoxItem
					>
					<!-- <ListBoxItem
						bind:group={selectTag}
						name={list.identifier ?? ''}
						value={index}
						on:change={() => onChange(list.identifier ?? '')}
						>{list.identifier}</ListBoxItem
					> -->
				{/each}
			{/if}
		</ListBox>

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{parent.buttonTextCancel}</button
			>
			{#if selectTag !== $modalStore[0].value.tag || $modalStore[0].value.bkm !== 'prv'}
				<button
					class="btn variant-filled-warning"
					on:click={() => {
						res.bkm = 'prv';
						onFormSubmit();
					}}>Private</button
				>
			{/if}
			{#if selectTag !== $modalStore[0].value.tag || $modalStore[0].value.bkm !== 'pub'}
				<button
					class="btn variant-filled-primary"
					on:click={() => {
						res.bkm = 'pub';
						onFormSubmit();
					}}>Public</button
				>
			{/if}
		</footer>
	</div>
{/if}
