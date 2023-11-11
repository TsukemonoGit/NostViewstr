<script lang="ts">
	import type { TabGroup, ToastSettings } from '@skeletonlabs/skeleton';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { nip19 } from 'nostr-tools';
	export let parent: any;
	import { _ } from 'svelte-i18n';

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
		{#if $modalStore[0].meta.tagArray}
			<div class="mt-2"><b>list tag</b></div>
			<div
				class="bg-surface-50-900-token break-words whitespace-pre-wrap max-h-60 overflow-auto p-1"
			>
				{JSON.stringify($modalStore[0].meta.tagArray)}
			</div>
		{/if}
		<footer class="modal-footer {parent.regionFooter}">
			<!--button-->
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					class="btn variant-filled-secondary p-1"
					on:click={() => onClickButton('note')}>copy noteID</button
				>

				<button
					type="button"
					class="btn variant-filled-secondary p-1"
					on:click={() => onClickButton('hex')}>copy hexID</button
				>

				<button
					type="button"
					class="btn variant-filled-surface p-2"
					on:click={parent.onClose}>{parent.buttonTextCancel}</button
				>
			</div>
		</footer>
	</div>
{/if}
