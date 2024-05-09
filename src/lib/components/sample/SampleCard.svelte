<script lang="ts">
	import { nip19, type Event } from 'nostr-tools';

	import { formatAbsoluteDate } from '$lib/otherFunctions.js';
	import { _ } from 'svelte-i18n';
	import SampleContent from './SampleContent.svelte';

	export let note: Event;

	export let metadata: Event | undefined;

	export let light: boolean;
	let metadataContent: NostrProfile;

	type NostrProfile = {
		name: string;
		display_name: string;
		picture: string;
	};

	$: if (metadata) {
		try {
			metadataContent = JSON.parse(metadata.content);
		} catch (error) {
			console.log('profile Json parse error');
		}
	}
</script>

<!--{#if $searchRelays}-->
<!-- <NostrApp relays={$searchRelays}> -->
<!-- ノート | ボタン群-->
<!-- <div
	class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
> -->
<!-- icon | その他-->
<div class="pl-1 grid grid-cols-[auto_1fr] gap-1.5">
	<!--icon-->

	<div
		class="w-12 h-12 rounded-full flex justify-center overflow-hidden variant-filled-surface mt-1 items-center truncate"
	>
		{#if metadataContent && light && metadataContent.picture}
			<img
				class="max-w-12 max-h-12 object-contain justify-center"
				src={metadataContent.picture}
				alt="avatar"
			/>
		{:else if metadataContent && metadataContent.name}
			{metadataContent.name}
		{:else}
			{nip19.npubEncode(note.pubkey).slice(5, 10)}
		{/if}
	</div>

	<!-- profile | note -->
	<div class="grid grid-rows-[auto_1fr] gap-0.5 w-full">
		<!-- name | display_name | time -->
		<div
			class="w-full grid grid-cols-[auto_1fr_auto] gap-1 h-fix overflow-x-hidden"
		>
			<!--profile-->
			{#if metadataContent}
				<!--name-->
				<div class="truncate wid justify-items-end">
					<div class="text-secondary-600 dark:text-secondary-400 font-semibold">
						{#if metadataContent.name !== ''}{metadataContent.name}
						{:else}
							{nip19.npubEncode(note.pubkey).slice(0, 12)}:{nip19
								.npubEncode(note.pubkey)
								.slice(-4)}
						{/if}
					</div>
				</div>
				<!--display_name-->
				<div
					class="text-left self-end text-sm h-fix wi truncate justify-items-end"
				>
					{#if metadataContent.display_name}
						{metadataContent.display_name}
					{/if}
				</div>
				<!--time-->
				<div class="min-w-max text-sm place-self-center">
					<!-- <button
						class="text-sm underline decoration-secondary-500"
						on:click={() => {
							if (tagArray) {
								OpenNoteJson(note, tagArray);
							}
						}}
						> -->{formatAbsoluteDate(
						note.created_at
					)}<!--</button
					>-->
				</div>
			{:else}
				<!--name-->
				<div class="w-fit text-secondary-600 dark:text-blue-500">
					<u>
						{nip19.npubEncode(note.pubkey).slice(0, 12)}:{nip19
							.npubEncode(note.pubkey)
							.slice(-4)}
					</u>
				</div>
				<!--display_name-->
				<div />
				<!--time-->
				<div class="min-w-max text-sm place-self-center">
					<!-- <button
						class="text-sm underline decoration-secondary-500"
						on:click={() => {
							if (tagArray) {
								OpenNoteJson(note, tagArray);
							}
						}}
						>-->{formatAbsoluteDate(
						note.created_at
					)}
					<!-- </button
					>-->
				</div>
			{/if}
		</div>

		<!--note-->

		<!--note-->
		<div class="break-all box-border overflow-x-auto">
			<SampleContent text={note.content} tag={note.tags} id={note.id} {light} />
		</div>
	</div>
</div>
