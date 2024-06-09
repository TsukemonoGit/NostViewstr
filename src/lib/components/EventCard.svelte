<script lang="ts">
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { Modal, Toast, getModalStore } from '@skeletonlabs/skeleton';
	import ModalProfile from '$lib/components/modals/ModalProfile.svelte';
	import ModalEventJson from '$lib/components/modals/ModalEventJson.svelte';
	import { nip19, type Event } from 'nostr-tools';

	import {
		formatAbsoluteDate,
		setComOgps,
		setLFCOgps,
		uniqueTags
	} from '$lib/otherFunctions.js';
	import { _ } from 'svelte-i18n';
	import EventTag from './EventTag.svelte';

	import Ogp from './OGP.svelte';
	import Content from './Content.svelte';
	import { allView, iconView } from '$lib/stores/settings';
	import PubCha from './PubCha.svelte';
	import EmojiSet from './EmojiSet.svelte';
	import OGP from './OGP.svelte';
	import { parseNaddr } from '$lib/nostrFunctions';

	export let isPageOwner: boolean;
	export let note: Event;

	export let metadata: Event | undefined;

	export let tagArray: string[] | undefined;
	export let pubkey: string;

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
			component: profileModalComponent,
			response: (res: { openList?: boolean; kind: number }) => {
				// if (res && res.openList) {
				// 	$listNum = 0;
				// 	console.log(res);
				// 	console.log(
				// 		`${window.location.origin}/${nip19.npubEncode(metadata.pubkey)}/${
				// 			res.kind
				// 		}`
				// 	);
				// 	goto(
				// 		`${window.location.origin}/${nip19.npubEncode(metadata.pubkey)}/${
				// 			res.kind
				// 		}`
				// 	);
				// }
			}
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
<!-- <div
	class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
> -->
<!-- icon | その他-->
<div class="pl-1 grid grid-cols-[auto_1fr] gap-1.5">
	<!--icon-->

	<button
		class="w-12 h-12 rounded-full flex justify-center overflow-hidden variant-filled-surface mt-1 items-center truncate"
		on:click={() => {
			if (metadata !== undefined) {
				OpenProfile(metadata);
			} else {
				OpenProfile({ pubkey: note.pubkey });
			}
		}}
	>
		{#if metadataContent && $iconView && metadataContent.picture}
			<img
				class="max-w-12 max-h-12 object-contain justify-center"
				src={metadataContent.picture}
				alt="avatar"
				loading="lazy"
			/>
		{:else if metadataContent && metadataContent.name}
			{metadataContent.name}
		{:else}
			{nip19.npubEncode(note.pubkey).slice(5, 10)}
		{/if}
	</button>

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
					<button
						class="text-secondary-600 dark:text-secondary-400 font-semibold"
						on:click={() => {
							if (metadata !== undefined) {
								OpenProfile(metadata);
							} else {
								OpenProfile({ pubkey: note.pubkey });
							}
						}}
						>{#if metadataContent.name !== ''}{metadataContent.name}
						{:else}
							{nip19.npubEncode(note.pubkey).slice(0, 12)}:{nip19
								.npubEncode(note.pubkey)
								.slice(-4)}
						{/if}
					</button>
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

		<!--tag?-->
		{#await uniqueTags(note.tags) then tags}
			{#if note.kind !== 30023 && note.kind !== 30030}<!--タグを表示しない-->
				{#if tags.length > 0}
					<div
						class="max-h-[4em] overflow-y-auto whitespace-nowrap border-s-4 border-s-surface-500/25 dark:border-s-surface-500/50 box-border h-fit"
					>
						{#each tags as tag}
							<EventTag
								{tag}
								handleClickDate={OpenNoteJson}
								handleClickPubkey={OpenProfile}
								{pubkey}
							/>
						{/each}
					</div>
				{/if}
			{/if}
			<!--note-->
			<div class="break-all box-border overflow-x-auto">
				{#if note.kind === 31990}
					{#await JsonCheck(note.content) then data}
						{#if data !== ''}
							<Ogp
								ogp={{
									title: data.name,
									image: data.banner,
									description: data.about,
									favicon: data.picture,
									memo: 'kind: ' + note.kind + ' Application'
								}}
								url={data.website}
							/>
						{/if}
					{/await}
				{:else if note.kind === 40 || note.kind === 41}
					<PubCha event={note} text={note.content} id={note.id} />
				{:else if note.kind === 30030}
					<EmojiSet event={note} />
				{:else if note.kind === 30023 && tagArray !== undefined}<!--long form content-->
					<OGP
						ogp={setLFCOgps(note, parseNaddr(tagArray)).ogp}
						url={setLFCOgps(note, parseNaddr(tagArray)).site +
							nip19.naddrEncode(parseNaddr(tagArray))}
					/>
				{:else if note.kind === 34550 && tagArray !== undefined}<!--communities-->
					<OGP
						ogp={setComOgps(note, parseNaddr(tagArray)).ogp}
						url={setComOgps(note, parseNaddr(tagArray)).site +
							nip19.naddrEncode(parseNaddr(tagArray))}
					/>
				{:else}<Content
						text={note.content}
						tag={note.tags}
						id={note.id}
						view={$allView}
						{isPageOwner}
						{pubkey}
					/>{/if}
			</div>
		{/await}
	</div>
</div>

<!--ボタン群-->
<!-- <MenuButtons
		{myIndex}
		{tagArray}
		{note}
		{menuMode}
		on:DeleteNote={DeleteNote}
		on:MoveNote={MoveNote}
		on:CheckNote={CheckNote}
	/> -->
<!-- </div> -->
<!-- </NostrApp> -->
<!--{/if}-->
