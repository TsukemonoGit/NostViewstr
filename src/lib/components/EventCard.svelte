<script lang="ts">
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { Modal, Toast, getModalStore } from '@skeletonlabs/skeleton';
	import ModalProfile from '$lib/components/modals/ModalProfile.svelte';
	import ModalEventJson from '$lib/components/modals/ModalEventJson.svelte';
	import { nip19, type Event } from 'nostr-tools';

	import { uniqueTags } from '$lib/otherFunctions.js';
	import { _ } from 'svelte-i18n';
	import type { MenuMode } from '$lib/otherFunctions.js';
	import EventTag from './EventTag.svelte';

	import Ogp from './OGP.svelte';
	import Content from './Content.svelte';
	import { allView, iconView } from '$lib/stores/settings';
	import MenuButtons from './MenuButtons.svelte';

	export let isPageOwner: boolean;
	export let note: Event;

	export let metadata: Event | undefined;

	export let menuMode: MenuMode;
	export let myIndex: number | undefined;
	export let tagArray: string[] | undefined;
	export let DeleteNote: (e: CustomEvent<any>) => void;
	export let MoveNote: (e: CustomEvent<any>) => void;
	export let CheckNote: (e: CustomEvent<any>) => void;

	//const dispatch = createEventDispatcher();

	let metadataContent: NostrProfile;
	const modalStore = getModalStore();

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

	//-------------------------------プロフィール表示
	const profileModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalProfile
	};

	const OpenProfile = (metadata: { pubkey: string } | Event) => {
		const modal: ModalSettings = {
			type: 'component',
			backdropClasses: '!bg-surface-400/80',
			meta: {
				metadata: metadata
			},
			component: profileModalComponent
		};

		modalStore.trigger(modal);
	};

	//-------------------------------イベントJSON表示
	const jsonModalComponent: ModalComponent = {
		ref: ModalEventJson
	};

	const OpenNoteJson = (text: Event, tag: string[]) => {
		const modal = {
			type: 'component' as const,
			title: 'Event Json',
			backdropClasses: '!bg-surface-400/80',
			meta: {
				note: text,
				tagArray: tag
			},

			component: jsonModalComponent
		};
		modalStore.trigger(modal);
	};

	function JsonCheck(text: string) {
		try {
			return JSON.parse(text);
		} catch (error) {
			return '';
		}
	}
</script>

<!--{#if $searchRelays}-->
<!-- <NostrApp relays={$searchRelays}> -->
<!-- ノート | ボタン群-->
<div
	class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
>
	<!-- icon | その他-->
	<div class="pl-1 grid grid-cols-[auto_1fr] gap-1.5">
		<!--icon-->
		{#if $iconView && metadata}
			<div
				class="w-12 h-12 rounded-full flex justify-center overflow-hidden bg-surface-500/25 mt-1"
			>
				{#if JSON.parse(metadata.content).picture}
					<img
						class="max-w-12 max-h-12 object-contain justify-center"
						src={JSON.parse(metadata.content).picture}
						alt="avatar"
					/>
				{/if}
			</div>
		{:else}
			<!--iconなし-->
			<div />
		{/if}

		<!-- profile | note -->
		<div class="grid grid-rows-[auto_1fr] gap-0.5 w-full">
			<!-- name | display_name | time -->
			<div
				class="w-full grid grid-cols-[auto_1fr_auto] gap-1 h-fix overflow-x-hidden"
			>
				<!--profile-->
				{#if metadata}
					<!--name-->
					<div class="truncate wid justify-items-end">
						<button
							class="text-secondary-600 dark:text-blue-500"
							on:click={() => {
								if (metadata !== undefined) {
									OpenProfile(metadata);
								} else {
									OpenProfile({ pubkey: note.pubkey });
								}
							}}
							><u
								>{#if JSON.parse(metadata.content).name !== ''}{JSON.parse(
										metadata.content
									).name}
								{:else}
									{nip19.npubEncode(note.pubkey).slice(0, 12)}:{nip19
										.npubEncode(note.pubkey)
										.slice(-4)}
								{/if}
							</u></button
						>
					</div>
					<!--display_name-->
					<div
						class="text-left self-end text-sm h-fix wi truncate justify-items-end"
					>
						{#if JSON.parse(metadata.content).display_name}
							{JSON.parse(metadata.content).display_name}
						{/if}
					</div>
					<!--time-->
					<div class="min-w-max">
						<button
							class="text-sm underline decoration-secondary-500"
							on:click={() => {
								if (tagArray) {
									OpenNoteJson(note, tagArray);
								}
							}}
							>{new Date(note.created_at * 1000).toLocaleString([], {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit',
								hour: '2-digit',
								minute: '2-digit'
							})}</button
						>
					</div>
				{:else}
					<!--name-->
					<button
						class="w-fit text-secondary-600 dark:text-blue-500"
						on:click={() => {
							OpenProfile({ pubkey: note.pubkey });
						}}
						><u>
							{nip19.npubEncode(note.pubkey).slice(0, 12)}:{nip19
								.npubEncode(note.pubkey)
								.slice(-4)}
						</u>
					</button>
					<!--display_name-->
					<div />
					<!--time-->
					<div class="min-w-max">
						<button
							class="text-sm underline decoration-secondary-500"
							on:click={() => {
								if (tagArray) {
									OpenNoteJson(note, tagArray);
								}
							}}
							>{new Date(note.created_at * 1000).toLocaleString([], {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit',
								hour: '2-digit',
								minute: '2-digit'
							})}</button
						>
					</div>
				{/if}
			</div>

			<!--note-->

			<!--tag?-->
			{#await uniqueTags(note.tags) then tags}
				{#if tags.length > 0}
					<div
						class="max-h-[4em] overflow-y-auto whitespace-nowrap border-s-4 border-s-surface-500/25 dark:border-s-surface-500/50 box-border"
					>
						{#each tags as tag}
							<EventTag
								{tag}
								handleClickDate={OpenNoteJson}
								handleClickPubkey={OpenProfile}
							/>
						{/each}
					</div>
				{/if}
				<!--note-->
				<div class="break-all box-border">
					{#if note.kind === 31990}
						{#await JsonCheck(note.content) then data}
							{#if data !== ''}
								<Ogp
									ogp={{
										title: data.name,
										image: data.banner,
										description: data.about,
										favicon: data.picture
									}}
									url={data.website}
								/>
							{/if}
						{/await}
					{:else}<Content
							text={note.content}
							tag={note.tags}
							id={note.id}
							view={$allView}
							{isPageOwner}
						/>{/if}
				</div>
			{/await}
		</div>
	</div>

	<!--ボタン群-->
	<MenuButtons
		{myIndex}
		{tagArray}
		{note}
		{menuMode}
		on:DeleteNote={DeleteNote}
		on:MoveNote={MoveNote}
		on:CheckNote={CheckNote}
	/>
</div>
<!-- </NostrApp> -->
<!--{/if}-->
