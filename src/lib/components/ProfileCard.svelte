<script lang="ts">
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { Modal, Toast, getModalStore } from '@skeletonlabs/skeleton';
	import ModalProfile from '$lib/components/modals/ModalProfile.svelte';
	import ModalEventJson from '$lib/components/modals/ModalEventJson.svelte';
	import { nip19, type Event } from 'nostr-tools';

	import { _ } from 'svelte-i18n';
	import type { MenuMode } from '$lib/otherFunctions.js';

	import { allView, iconView } from '$lib/stores/settings';
	import MenuButtons from './MenuButtons.svelte';
	import { goto } from '$app/navigation';
	import {
		bookmarkEvents,
		identifierList,
		listNum
	} from '$lib/stores/bookmarkEvents';
	import {
		bookmarkRelays,
		postRelays,
		relayEvent,
		searchRelays
	} from '$lib/stores/relays';

	export let metadata: Event;

	export let menuMode: MenuMode;
	export let myIndex: number | undefined;
	export let tagArray: string[] | undefined;
	export let DeleteNote: (e: CustomEvent<any>) => void;
	export let MoveNote: (e: CustomEvent<any>) => void;
	export let CheckNote: (e: CustomEvent<any>) => void;

	//const dispatch = createEventDispatcher();

	async function metadataContent(
		content: string
	): Promise<NostrProfile | undefined> {
		try {
			return JSON.parse(content);
		} catch (error) {
			console.log('profile Json parse error');
			return undefined;
		}
	}
	const modalStore = getModalStore();

	type NostrProfile = {
		name: string;
		display_name: string;
		picture: string;
		about: string;
	};

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
			response: (res) => {
				if (res && res.openList) {
					//storeのリセット
					$bookmarkEvents = [];
					$bookmarkRelays = [];
					$postRelays = [];
					$searchRelays = [];
					$identifierList = [];
					$listNum = 0;

					goto(
						`${window.location.origin}/${nip19.npubEncode(metadata.pubkey)}`
					);
				}
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
			return 'Json parse error';
		}
	}
</script>

<!--{#if $searchRelays}-->
<!-- <NostrApp relays={$searchRelays}> -->
<!-- ノート | ボタン群-->
<div
	class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
>
	{#await metadataContent(metadata.content) then content}
		{#if content !== undefined}
			<!-- icon | その他-->
			<div class="pl-1 grid grid-cols-[auto_1fr] gap-1.5">
				<!--icon-->
				{#if $iconView && metadata}
					<div
						class="w-12 h-12 rounded-full flex justify-center overflow-hidden bg-surface-500/25 mt-1"
					>
						{#if content.picture}
							<img
								class="max-w-12 max-h-12 object-contain justify-center"
								src={content.picture}
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

						<!--name-->
						<div class="truncate wid justify-items-end">
							<button
								class="text-secondary-600 dark:text-blue-500"
								on:click={() => {
									OpenProfile(metadata);
								}}
								><u
									>{#if content.name !== ''}{content.name}
									{:else}
										{nip19.npubEncode(metadata.pubkey).slice(0, 12)}:{nip19
											.npubEncode(metadata.pubkey)
											.slice(-4)}
									{/if}
								</u></button
							>
						</div>
						<!--display_name-->
						<div
							class="text-left self-end text-sm h-fix wi truncate justify-items-end"
						>
							{#if content.display_name}
								{content.display_name}
							{/if}
						</div>
						<!--time-->
						<div class="min-w-max">
							<button
								class="text-sm underline decoration-secondary-500"
								on:click={() => {
									if (tagArray) {
										OpenNoteJson(metadata, tagArray);
									}
								}}
								>{new Date(metadata.created_at * 1000).toLocaleString([], {
									year: 'numeric',
									month: '2-digit',
									day: '2-digit',
									hour: '2-digit',
									minute: '2-digit'
								})}</button
							>
						</div>
					</div>

					<!--note-->

					<!--tag?-->

					<!--note-->
					<div class="break-all box-border whitespace-break-spaces">
						{content.about}
						<!-- <Content
					text={note.content}
					tag={note.tags}
					id={note.id}
					view={$allView}
					{isPageOwner}
				/> -->
					</div>
				</div>
			</div>

			<!--ボタン群-->
			<MenuButtons
				{myIndex}
				{tagArray}
				note={metadata}
				{menuMode}
				share={false}
				on:DeleteNote={DeleteNote}
				on:MoveNote={MoveNote}
				on:CheckNote={CheckNote}
			/>
		{/if}
	{/await}
</div>
<!-- </NostrApp> -->
<!--{/if}-->
