<script lang="ts">
	import type { TabGroup, ToastSettings } from '@skeletonlabs/skeleton';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { nip19 } from 'nostr-tools';
	import copyIcon from '@material-design-icons/svg/round/content_copy.svg?raw';
	import { _ } from 'svelte-i18n';
	import { parseNaddr } from '$lib/nostrFunctions';
	import type { Nostr } from 'nosvelte';

	export let parent: any;

	// Base Classes
	const cBase = 'card p-4  shadow-xl  break-all';
	const cHeader = 'text-2xl font-bold';
	//$modalStore[0]?.meta.hexKey

	function onClickButton(str: string) {
		const text =
			str === 'note'
				? nip19.noteEncode($modalStore[0]?.meta.note.id)
				: $modalStore[0]?.meta.note.id;

		navigator.clipboard.writeText(text).then(
			() => {
				// コピーに成功したときの処理
				console.log(`copied: ${text.slice(0, 15)}...`);

				const t: ToastSettings = {
					message: `copied: ${text.slice(0, 15)}...`,
					timeout: 3000
				};
				toastStore.trigger(t);
			},
			() => {
				// コピーに失敗したときの処理
				console.log('failed to copy');
				/**@type {import('@skeletonlabs/skeleton').ToastSettings}*/
				const t: ToastSettings = {
					message: $_('modal.failed_copy'),
					timeout: 3000,
					background: 'bg-orange-500 text-white width-filled '
				};
				toastStore.trigger(t);
			}
		);

		parent.onClose();
	}
	function copyEncodedID(tag: string[]) {
		console.log(tag);
		try {
			const copyString =
				tag[0] === 'a'
					? nip19.naddrEncode(parseNaddr(tag))
					: tag[0] === 'p'
					? nip19.npubEncode(tag[1])
					: tag[1];
			navigator.clipboard.writeText(copyString).then(
				() => {
					// コピーに成功したときの処理
					console.log(`copied: ${copyString.slice(0, 15)}...`);

					const t: ToastSettings = {
						message: `copied: ${copyString.slice(0, 15)}...`,
						timeout: 3000
					};
					toastStore.trigger(t);
				},
				() => {
					// コピーに失敗したときの処理
					console.log('failed to copy');
					/**@type {import('@skeletonlabs/skeleton').ToastSettings}*/
					const t: ToastSettings = {
						message: $_('modal.failed_copy'),
						timeout: 3000,
						background: 'bg-orange-500 text-white width-filled '
					};
					toastStore.trigger(t);
				}
			);
		} catch (error) {
			console.log('failed to copy');
		}
	}

	const downloadJson = () => {
		const event = $modalStore[0].meta.note as Nostr.Event;
		const jsonStr = JSON.stringify(event, null, 2);
		const blob = new Blob([jsonStr], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const dtag = event.tags.find((item) => item[0] === 'd');
		const fileName = dtag
			? `bkmstr_kind${event.kind}_${dtag[1]}_${event.created_at}`
			: `bkmstr_kind${event.kind}_${event.created_at}.json`;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};
</script>

<!-- @component This example creates a simple form modal. -->
{#if $modalStore[0]}
	<div class="modal-example-form {cBase} bg-surface-200-700-token">
		<header class={cHeader}>
			{$modalStore[0].title ?? '(title missing)'}
		</header>

		<div
			class="bg-surface-50-900-token break-words whitespace-pre-wrap max-h-60 overflow-auto break-all max-w-[768px] p-1"
		>
			{JSON.stringify($modalStore[0].meta.note, undefined, 4)}
		</div>
		<div class="text-right text-sm">
			Content Length: {$modalStore[0].meta.note.content.length}, Tags Count: {$modalStore[0]
				.meta.note.tags.length}
		</div>
		{#if $modalStore[0].meta.tagArray && $modalStore[0].meta.tagArray.length > 0}
			<div class="mt-2"><b>list tag</b></div>
			<div class="grid grid-cols-[1fr_auto] max-w-[768px]">
				<div
					class="bg-surface-50-900-token break-words whitespace-pre-wrap max-h-60 overflow-auto p-1"
				>
					{JSON.stringify($modalStore[0].meta.tagArray)}
				</div>
				{#if $modalStore[0].meta.tagArray[0] === 'a' || $modalStore[0].meta.tagArray[0] === 'p'}
					<button
						class="btn-icon h-full dark:fill-white"
						on:click={() => copyEncodedID($modalStore[0].meta.tagArray)}
						>{@html copyIcon}</button
					>
				{/if}
			</div>
		{/if}
		<footer class="modal-footer {parent.regionFooter} mt-2">
			<!--button-->
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					class="btn variant-filled-success p-1"
					on:click={downloadJson}>Download Json</button
				>
				<button
					type="button"
					class="btn variant-filled-secondary p-1"
					on:click={() => onClickButton('note')}>copy noteID</button
				>

				<!-- <button
					type="button"
					class="btn variant-filled-secondary p-1"
					on:click={() => onClickButton('hex')}>copy hexID</button
				> -->

				<button
					type="button"
					class="btn variant-filled-surface p-2"
					on:click={parent.onClose}>{parent.buttonTextCancel}</button
				>
			</div>
		</footer>
	</div>
{/if}
