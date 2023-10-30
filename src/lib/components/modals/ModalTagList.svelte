<script lang="ts">
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import { modalStore, toastStore } from '$lib/stores/store';
	// Props
	/** Exposes parent props to this component. */
	export let parent: any;
	// Local
	let res = { index: -1 };

	let selectTag: number;
	//$: moveList = $tags.filter((item) => item !== $tags[$tabSet]);
	// Handle Form Submission
	function onFormSubmit(index: number): void {
		res.index = index;
		if ($modalStore[0].response) {
			$modalStore[0].response(res);
		}
		console.log(res);
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
			{#each $modalStore[0].value.tagList as list, index}
				<ListBoxItem
					bind:group={selectTag}
					name={list}
					value={index}
					class="truncate"
					on:change={() => onFormSubmit(index)}>{list}</ListBoxItem
				>
			{/each}
		</ListBox>

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{parent.buttonTextCancel}</button
			>
		</footer>
	</div>
{/if}
