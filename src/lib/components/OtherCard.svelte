<script lang="ts">
	//これつかわれてるとこある？？？これなに
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { Modal, Toast, getModalStore } from '@skeletonlabs/skeleton';
	import ModalProfile from '$lib/components/modals/ModalProfile.svelte';
	import ModalEventJson from '$lib/components/modals/ModalEventJson.svelte';
	import ModalPostNote from '$lib/components/modals/ModalPostNote.svelte';
	import DeleteIcon from '@material-design-icons/svg/round/delete.svg?raw';
	import MoveIcon from '@material-design-icons/svg/round/arrow_circle_right.svg?raw';
	import OpenIcon from '@material-design-icons/svg/round/open_in_browser.svg?raw';
	import ShareIcon from '@material-design-icons/svg/round/chat.svg?raw';
	import { createEventDispatcher } from 'svelte';
	import { nip19, type Event } from 'nostr-tools';
	import { parseNaddr, windowOpen } from '$lib/nostrFunctions';
	import { uniqueTags, MenuMode } from '$lib/otherFunctions.js';
	import { _ } from 'svelte-i18n';

	import EventTag from './EventTag.svelte';

	import { checkedIndexList } from '$lib/stores/bookmarkEvents';
	import Ogp from './OGP.svelte';
	import Content from './Content.svelte';
	import { allView, iconView } from '$lib/stores/settings';

	export let isPageOwner: boolean;
	export let note: Event;

	export let metadata: Event | undefined;

	export let myIndex: number | undefined;
	export let tagArray: string[] | undefined;
	export let pubkey: string;
	const dispatch = createEventDispatcher();

	let metadataContent: NostrProfile;
	const modalStore = getModalStore();

	enum State {
		Default,
		Delete,
		Move,
		Check
	}

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

	function handleClick(state: State) {
		switch (state) {
			case State.Delete:
				dispatch('DeleteNote', { number: myIndex });
				break;

			case State.Move:
				dispatch('MoveNote', { number: myIndex });
				break;
			case State.Check:
				dispatch('CheckNote', { number: myIndex });
				break;
		}
	}

	//-----------------------------------------------引用ポスト
	const postNoteModalComponent: ModalComponent = {
		ref: ModalPostNote
	};
	function shareNote() {
		const tags = tagArray
			? tagArray[0] === 'e'
				? note?.kind !== 1
					? [[...tagArray, '', 'mention']]
					: [['q', ...tagArray.slice(1)]]
				: [tagArray]
			: [];
		const modal: ModalSettings = {
			type: 'component',
			component: postNoteModalComponent,
			backdropClasses: '!bg-surface-400/80 ',
			title: $_('modal.postNote.title'),
			body: ``,
			value: {
				content: `${
					tagArray && tagArray[0] === 'a'
						? `\r\nnostr:${nip19.naddrEncode(parseNaddr(tagArray))}`
						: tagArray && tagArray[0] === 'e'
						? note?.kind === 1
							? `\r\nnostr:${nip19.noteEncode(tagArray[1])}`
							: `\r\nnostr:${nip19.neventEncode({
									id: tagArray[1],
									relays: []
							  })}`
						: ''
				}`,
				tags: tags,
				kind: note.kind,
				pubkey: note.pubkey
			}
			// response: async (res) => {
			// 	console.log(res);
			// 	if (res) {
			// 		//帰ってきた値によってなんやかんや
			// 		//でもポストノートは別に戻ってきてからやんなくても良くない？
			// 	}
			// }
		};
		modalStore.trigger(modal);
	}

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
<!-- <div class="card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"> -->
<!-- icon | その他-->
<div class="grid grid-cols-[auto_1fr] gap-1">
	<!--icon-->
	{#if $iconView && metadata}
		<div
			class="w-12 h-12 rounded-full flex justify-center overflow-hidden bg-surface-500/25 mt-1"
		>
			{#if JSON.parse(metadata.content).picture}
				<img
					loading="lazy"
					class="w-12 object-contain justify-center"
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
				<div class="min-w-max text-sm place-self-center">
					<!-- <button
							class="text-sm underline decoration-secondary-500"
							on:click={() => {
								if (tagArray) {
									OpenNoteJson(note, tagArray);
								}
							}}>-->{new Date(
						note.created_at * 1000
					).toLocaleString()}<!-- </button 
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
							}}>-->{new Date(
						note.created_at * 1000
					).toLocaleString()}
					<!-- </button 
						>-->
				</div>
			{/if}
		</div>

		<!--note-->
		<div
			class="parent-container break-all whitespace-pre-wrap overflow-x-hidden"
		>
			<!--tag?-->
			{#await uniqueTags(note.tags) then tags}
				{#if tags.length > 0}
					<div
						class="max-h-[6em] overflow-y-auto whitespace-nowrap border-s-4 border-s-surface-500/25 dark:border-s-surface-500/50"
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
				<!--note-->
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
				{:else}
					<!--{note.content}-->
					<Content
						text={note.content}
						tag={note.tags}
						id={note.id}
						view={$allView}
						{pubkey}
						{isPageOwner}
					/>
				{/if}
			{/await}
		</div>
	</div>
</div>

<!--ボタン群-->

<!-- </NostrApp> -->
<!--{/if}-->
