<script lang="ts">
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import ModalProfile from '$lib/components/modals/ModalProfile.svelte';
	//import ModalEventJson from '$lib/components/modals/ModalEventJson.svelte';
	import { nip19, type Event, nip05 } from 'nostr-tools';

	import { _ } from 'svelte-i18n';
	import { formatAbsoluteDate, loadOgp } from '$lib/otherFunctions.js';
	import OGP from './OGP.svelte';
	import { URLPreview, allView, iconView } from '$lib/stores/settings';
	import { goto } from '$app/navigation';
	import { listNum, ogpStore } from '$lib/stores/bookmarkEvents';

	import Content from './Content.svelte';
	import LatestNote from './LatestNote.svelte';

	export let metadata: Event;

	//export let menuMode: MenuMode;
	//export let myIndex: number | undefined;
	export let tagArray: string[] | undefined;
	//export let DeleteNote: (e: CustomEvent<any>) => void;
	//export let MoveNote: (e: CustomEvent<any>) => void;
	//export let CheckNote: (e: CustomEvent<any>) => void;

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
		website?: string;
		nip05?: string;
	};

	//-------------------------------プロフィール表示
	const profileModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalProfile
	};

	const OpenProfile = (metadata: { pubkey: string } | Event) => {
		if (metadata == undefined && tagArray) {
			metadata = { pubkey: tagArray[1] };
		}
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
					// $bookmarkEvents = [];

					// $identifierList = [];
					$listNum = 0;

					goto(
						`${window.location.origin}/${nip19.npubEncode(metadata.pubkey)}`
					);
				}
			}
		};

		modalStore.trigger(modal);
	};

	// //-------------------------------イベントJSON表示
	// const jsonModalComponent: ModalComponent = {
	// 	ref: ModalEventJson
	// };

	// const OpenNoteJson = (text: Event, tag: string[]) => {
	// 	const modal = {
	// 		type: 'component' as const,
	// 		title: 'Event Json',
	// 		backdropClasses: '!bg-surface-400/80',
	// 		meta: {
	// 			note: text,
	// 			tagArray: tag
	// 		},

	// 		component: jsonModalComponent
	// 	};
	// 	modalStore.trigger(modal);
	// };
</script>

<!--{#if $searchRelays}-->
<!-- <NostrApp relays={$searchRelays}> -->
<!-- ノート | ボタン群-->
<!-- <div
	class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
> -->
{#await metadataContent(metadata.content) then content}
	{#if content !== undefined}
		<!-- icon | その他-->
		<div class="pl-1 grid grid-cols-[auto_1fr] gap-1.5">
			<!--icon-->

			<button
				class="w-12 h-12 rounded-full flex justify-center overflow-hidden variant-filled-surface mt-1 items-center truncate"
				on:click={() => {
					OpenProfile(metadata);
				}}
			>
				{#if $iconView && content.picture}
					<img
						loading="lazy"
						class="max-w-12 max-h-12 object-contain justify-center"
						src={content.picture}
						alt="avatar"
					/>
				{:else}
					<!--iconなし-->

					{content.name}
				{/if}
			</button>

			<!-- profile | note -->
			<div class="grid grid-rows-[auto_1fr] w-full">
				<!-- name | display_name | time -->
				<div
					class="w-full grid grid-cols-[auto_1fr_auto] gap-1 h-fix overflow-x-hidden"
				>
					<!--profile-->

					<!--name-->
					<div class="truncate wid justify-items-end">
						<button
							class="text-secondary-600 dark:text-secondary-400 font-semibold"
							on:click={() => {
								OpenProfile(metadata);
							}}
							>{#if content.name !== ''}{content.name}
							{:else}
								{nip19.npubEncode(metadata.pubkey).slice(0, 12)}:{nip19
									.npubEncode(metadata.pubkey)
									.slice(-4)}
							{/if}
						</button>
					</div>
					<!--display_name-->
					<div
						class="text-left self-end text-sm h-fix wi truncate justify-items-end"
					>
						{#if content.display_name}
							{content.display_name}
						{/if}
						{#if tagArray && tagArray.length >= 4 && tagArray[3] !== ''}
							📛{tagArray[3]}<!--ペットネームがついてたらつける-->
						{/if}
					</div>
					<!--time-->
					<div class="min-w-max text-sm place-self-center">
						<!-- <button
							class="text-sm underline decoration-secondary-500"
							on:click={() => {
								if (tagArray) {
									OpenNoteJson(metadata, tagArray);
								}
							}}
							>-->{formatAbsoluteDate(
							metadata.created_at
						)}
					</div>
				</div>

				<!--note-->

				<!--tag?-->

				{#if content.nip05}
					<div class="text-sm">
						{#await nip05.queryProfile(content.nip05) then pointer}
							{#if pointer !== null}
								{content.nip05}
							{/if}
						{/await}
					</div>
				{/if}

				<!--note-->
				<div class="py-2 break-all box-border whitespace-break-spaces">
					<!-- {content.about} -->
					<Content
						text={content.about}
						tag={metadata.tags}
						id={metadata.id}
						view={$allView}
						isPageOwner={false}
						pubkey={metadata.pubkey}
					/>
				</div>

				{#if content.website}
					{#if $URLPreview}{#await loadOgp(content.website)}<a
								class="anchor mb-0.5 break-all"
								href={content.website}
								rel="external noreferrer"
								target="_blank">{content.website}</a
							>{:then ogp}{#if $ogpStore[content.website] && $ogpStore[content.website].title && $ogpStore[content.website].title !== ''}
								<OGP ogp={$ogpStore[content.website]} url={content.website} />
							{:else}<a
									class="anchor mb-0.5 break-all"
									href={content.website}
									rel="external noreferrer"
									target="_blank">{content.website}</a
								>{/if}{/await}{:else}<a
							class="anchor mb-0.5 break-all"
							href={content.website}
							rel="external noreferrer"
							target="_blank">{content.website}</a
						>{/if}
				{/if}

				<LatestNote pubkey={metadata.pubkey} />
			</div>
		</div>

		<!--metadataパースエラー-->
	{:else if tagArray}
		{JSON.stringify(tagArray)}
	{/if}
{/await}
<!-- </div> -->
<!-- </NostrApp> -->
<!--{/if}-->
