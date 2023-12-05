<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { pubkey_viewer } from '$lib/stores/settings';
	import {
		identifierKeysArray,
		identifierListsMap
	} from '$lib/stores/bookmarkEvents';
	// Props
	/** Exposes parent props to this component. */
	export let parent: any;
	// Local
	let res = { index: -1, edit: false };

	let selectTag: number;
	let pubkey = $modalStore[0]?.value?.pubkey ?? '';
	let kind = $modalStore[0]?.value?.kind ?? -1;
	//$: moveList = $tags.filter((item) => item !== $tags[$tabSet]);
	// Handle Form Submission
	function onFormSubmit(): void {
		console.log(res);
		//	res.index = index;
		if ($modalStore[0].response) {
			$modalStore[0].response(res);
		}

		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4 break-all';
	const cHeader = 'text-2xl font-bold';
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>
			{$modalStore[0].title ?? '(title missing)'}
		</header>
		<article>{$modalStore[0].body ?? '(body missing)'}</article>

		<ListBox
			class="border border-surface-500 p-4 rounded-container-token max-h-80 overflow-y-auto"
		>
			{#if kind !== -1 && pubkey !== '' && $identifierListsMap[pubkey][kind].size > 0}
				{#each $identifierKeysArray as list, index}
					<ListBoxItem
						bind:group={selectTag}
						name={$identifierListsMap[pubkey][kind].get(list)?.identifier ?? ''}
						value={index}
						class="truncate"
						on:change={() => {
							res.edit = false;
							res.index = index;
							onFormSubmit();
						}}
						>{$identifierListsMap[pubkey][kind].get(list)?.identifier}
						{$identifierListsMap[pubkey][kind].get(list)?.title
							? `【${$identifierListsMap[pubkey][kind].get(list)?.title}】`
							: ''}</ListBoxItem
					>
				{/each}
			{:else}
				{$_('modal.tagList.noList')}
			{/if}
		</ListBox>

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{parent.buttonTextCancel}</button
			>

			<button
				class="btn {parent.buttonPositive}"
				disabled={$modalStore[0].value.pubkey !== $pubkey_viewer}
				on:click={() => {
					res.index = -1;
					res.edit = true;
					onFormSubmit();
				}}>{$_('modal.tagList.editTag')}</button
			>
		</footer>
	</div>
{/if}
