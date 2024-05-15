<script lang="ts">
	import { windowOpen } from '$lib/nostrFunctions';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { nip19 } from 'nostr-tools';

	import { kinds } from '$lib/kind';
	import { goto } from '$app/navigation';
	import SelectKindList from '../SelectKindList.svelte';

	export let parent: any;
	let selectValue: string = Object.keys(kinds)[0];
	//let kind: number;

	let profileContent: {
		[x: string]: string | null | undefined;
		picture: any;
	};
	// Base Classes
	const cBase = 'card p-4  shadow-xl space-y-4 break-all';
	$: if ($modalStore[0]?.meta?.metadata?.content) {
		try {
			profileContent = JSON.parse($modalStore[0].meta.metadata.content);
		} catch (error) {
			console.log('failed to open profileJSON');
		}
	}

	let res: { openList?: boolean; kind: number } = {
		openList: false,
		kind: Number(Object.keys(kinds)[0])
	};
	$: console.log(res);
	function onFormSubmit(): void {
		console.log(res.kind);
		if ($modalStore[0].response) $modalStore[0].response(res);

		modalStore.close();
	}

	//$modalStore[0]?.meta.hexKey
	function onClickButton(str: string) {
		const text =
			str === 'npub'
				? nip19.npubEncode($modalStore[0]?.meta.metadata.pubkey)
				: $modalStore[0]?.meta.metadata.pubkey;

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

				const t: ToastSettings = {
					message: 'failed to copy',
					timeout: 3000,
					background: 'bg-orange-500 text-white width-filled '
				};
				toastStore.trigger(t);
			}
		);

		parent.onClose();
	}

	// function handleKindChange(event: { currentTarget: HTMLSelectElement }) {
	// 	kind = Number(event.currentTarget.value);
	// 	console.log(kind);
	// }
</script>

<!-- @component This example creates a simple form modal. -->
{#if $modalStore[0]}
	<div class=" modal-example-form {cBase} ">
		<!--profile-->

		<div class="grid grid-row-[auto_auto_auto] gap-1 max-w-md">
			<div class="grid grid-cols-[auto_1fr] gap-2 max-w-md max-h-40">
				<div
					class="w-16 h-16 rounded-lg flex justify-center overflow-hidden bg-surface-500/25"
				>
					{#if profileContent && profileContent.picture}
						<img
							class="w-16 object-contain justify-center"
							src={profileContent.picture}
							alt="avatar"
						/>
					{/if}
				</div>
				<div>
					{#if profileContent && profileContent.banner}
						<img class="" src={profileContent.banner} alt="" />
					{/if}
				</div>
			</div>
			<div
				class="rounded-sm border-4 border-dotted border-surface-300 p-1 bg-surface-100/80 dark:bg-surface-800/80"
			>
				<div class="font-bold">about</div>
				{#if profileContent && profileContent.about}
					<div
						class="break-all whitespace-pre-wrap text-sm max-h-32 overflow-auto"
					>
						{profileContent.about}
					</div>
				{/if}
			</div>
			<div
				class="rounded-sm border-4 border-dotted border-surface-300 p-1 bg-surface-100/80 dark:bg-surface-800/80"
			>
				<div class="font-bold">profileJSON</div>
				{#if profileContent}
					<div
						class="break-all whitespace-pre-wrap text-sm max-h-24 overflow-auto"
					>
						{JSON.stringify(profileContent, undefined, 4)}
					</div>
				{/if}
			</div>
		</div>

		<!--button-->
		<div class="grid grid-cols-[auto_auto] gap-2">
			<div class="grid grid-row-[auto_auto] gap-2">
				<div class="flex">
					<SelectKindList let:kindList bind:selectValue>
						<select class="input p-1" bind:value={selectValue}>
							{#each Array.from(kindList) as [key, value]}
								<option value={key}>{`${value} (${key})`}</option>
							{/each}
						</select></SelectKindList
					>
					<button
						type="button"
						class="btn variant-filled-secondary p-1"
						on:click={() => {
							//res.openList = true;
							//res.kind = Number(selectValue);
							// if (res && res.openList) {

							goto(
								`${window.location.origin}/${nip19.npubEncode(
									$modalStore[0]?.meta.metadata.pubkey
								)}/${selectValue}`
							);
							modalStore.close();
							//onFormSubmit();
						}}>open Lists</button
					>
				</div>
				<button
					type="button"
					class="btn variant-filled-secondary p-1"
					on:click={() => onClickButton('npub')}>copy pubKey</button
				>
			</div>
			<div class="grid grid-row-[auto_auto] gap-2">
				<button
					type="button"
					class="btn variant-filled-surface p-2"
					on:click={() => {
						windowOpen(nip19.npubEncode($modalStore[0]?.meta.metadata.pubkey));

						parent.onClose();
					}}>Open in external app</button
				>

				<button
					type="button"
					class="btn variant-filled-surface p-2"
					on:click={parent.onClose}>{parent.buttonTextCancel}</button
				>
			</div>
		</div>
	</div>
{/if}

<style>
	.banner {
		min-width: 6em;
		max-width: 100px;
	}
	.profile {
		text-shadow: 1px 1px 2px lightgray, -1px -1px 2px lightgray;
	}
</style>
