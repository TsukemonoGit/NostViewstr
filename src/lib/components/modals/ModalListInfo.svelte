<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';
	import infoIcon from '@material-design-icons/svg/round/info.svg?raw';
	import shareIcon from '@material-design-icons/svg/round/chat.svg?raw'; //'@material-design-icons/svg/round/share.svg?raw';
	import { identifierList, listNum } from '$lib/stores/bookmarkEvents';
	import { pubkey_viewer } from '$lib/stores/settings';

	export let parent: any;

	$: pubkey = $modalStore[0]?.value?.pubkey;
	$: kind = $modalStore[0]?.value?.kind;

	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response(res);

		modalStore.close();
	}
	// Form Data
	let res: {
		title?: string;
		image?: string;
		description?: string;
		share?: boolean;
		update?: boolean;
	} = {
		title: $identifierList[pubkey][kind][$listNum].title ?? '',
		image: $identifierList[pubkey][kind][$listNum].image ?? '',
		description: $identifierList[pubkey][kind][$listNum].description ?? ''
	};
	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold flex fill-white stroke-primary-400';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<div class="grid grid-cols-[1fr_auto]">
			<header class={cHeader}>
				{@html infoIcon}{$modalStore[0].title ?? '(title missing)'}
			</header>
			<button
				on:click={() => {
					res.share = true;
					onFormSubmit();
				}}
				class="btn-icon variant-filled-primary fill-white"
				>{@html shareIcon}</button
			>
		</div>

		<div class=" ">
			<label class="label mt-2">
				<span class="font-bold">title</span>
				{$_('modal.listInfo.ex.title')}
				<input
					class="input p-2"
					type="text"
					disabled={$modalStore[0].value.pubkey !== $pubkey_viewer}
					bind:value={res.title}
					placeholder=""
				/>
			</label>

			<label class="label mt-2">
				<span class="font-bold">image</span>
				{$_('modal.listInfo.ex.image')}
				<input
					class="input p-2"
					type="text"
					disabled={$modalStore[0].value.pubkey !== $pubkey_viewer}
					bind:value={res.image}
					placeholder=""
				/>
			</label>
			<img class="max-h-24 m-2" src={res.image} alt="" />
			<label class="label mt-2">
				<span class="font-bold">description</span>
				{$_('modal.listInfo.ex.summary')}
				<textarea
					class="input p-2 max-h-24 overflow-y-auto break-all"
					disabled={$modalStore[0].value.pubkey !== $pubkey_viewer}
					bind:value={res.description}
					placeholder=""
				/>
			</label>
		</div>

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{parent.buttonTextCancel}</button
			>

			<button
				class="btn {parent.buttonPositive}"
				on:click={() => {
					res.update = true;
					onFormSubmit();
				}}
				disabled={$modalStore[0].value.pubkey !== $pubkey_viewer}>Update</button
			>
		</footer>
	</div>
{/if}

<style>
	:global(header svg) {
		width: 1.5em;
		height: 1.5em;
	}
</style>
