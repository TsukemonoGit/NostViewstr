<script lang="ts">
	import { publishEventWithTimeout } from '$lib/streamEventLists';
	import {
		connectingRelays,
		eventListsMap,
		identifierKeysArray,
		identifierListsMap,
		keysArray,
		listNum,
		relayState
	} from '$lib/stores/bookmarkEvents';
	import { pageNum } from '$lib/stores/pagination';
	import { iconView, nowProgress, pubkey_viewer } from '$lib/stores/settings';
	// import PrvBkm from './Button/PrvBkm.svelte';
	// import PubBkm from './Button/PubBkm.svelte';
	import { prvIcon } from '$lib/components/icons';
	import { pubIcon } from '$lib/components/icons';
	import RelayIcon from '@material-design-icons/svg/outlined/hub.svg?raw';
	import infoIcon from '@material-design-icons/svg/round/info.svg?raw';
	import { relaySet } from '$lib/stores/relays';
	import { modalStore, toastStore } from '$lib/stores/store';
	import {
		popup,
		type ModalComponent,
		type ModalSettings,
		type PopupSettings,
		storePopup
	} from '@skeletonlabs/skeleton';
	import type { Nostr } from 'nosvelte';
	import { _ } from 'svelte-i18n';
	import ModalListInfo from './modals/ModalListInfo.svelte';
	import ModalPostNote from './modals/ModalPostNote.svelte';
	import { nip19 } from 'nostr-tools';
	import ModalEventJson from './modals/ModalEventJson.svelte';
	import { kinds } from '$lib/kind';
	import { goto } from '$app/navigation';
	import RelayStateIcon from './RelayStateIcon.svelte';
	import UserIcon from './UserIcon.svelte';
	import { formatAbsoluteDate } from '$lib/otherFunctions';

	export let bkm: string;
	export let kind: number;
	export let pubkey: string;
	export let viewEvent: Nostr.Event<number> | undefined;
	export let JSON: boolean = false;
	export let nevent: boolean = false;
	let ongoingCount: number;

	$: console.log($storePopup.popupFeatured);
	$: console.log(popupFeatured.state);
	let pupupOpen: boolean = false;

	$: console.log(pupupOpen);
	$: readTrueArray = $connectingRelays
		? Object.keys($connectingRelays).filter(
				(item) => $connectingRelays[item].read === true
		  )
		: [];

	$: ongoingCount =
		$relayState && readTrueArray.length > 0
			? readTrueArray.filter((relay) => $relayState[relay] === 'ongoing').length
			: 0;

	// afterUpdate(() => {

	// 	console.log('[relay state]', $relayState);
	// 	ongoingCount =
	// 		$relayState && Object.keys($relayState).length > 0
	// 			? Object.values($relayState).filter((state) => state === 'ongoing')
	// 					.length
	// 			: 0;
	// });

	$: listNaddr = viewEvent
		? [
				'a',
				`${viewEvent.kind}:${viewEvent.pubkey}:${
					$identifierListsMap?.[pubkey]?.[kind]?.get(
						$identifierKeysArray[$listNum]
					)?.identifier || ''
				}`
		  ]
		: [];

	const borderDefault = `rounded-tl-container-token rounded-tr-container-token break-keep place-items-end h6 bkm flex  sm:px-4 py-2 px-0.5 h-fit align-bottom place-self-end`;
	const borderClassActive = `bg-primary-200-700-token fill-black  dark:fill-white ${borderDefault}`;
	const borderClass = `fill-white ${borderDefault}    `;

	//-------------------------------------------------------edit tag
	const listInfoModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalListInfo
		// Add the component properties as key/value pairs
	};

	//-----------------------------------------------引用ポスト
	const postNoteModalComponent: ModalComponent = {
		ref: ModalPostNote
	};

	async function listInfoModalOpen() {
		const modal: ModalSettings = {
			type: 'component',

			// Pass the component directly:
			component: listInfoModalComponent,
			// Provide arbitrary metadata to your modal instance:
			title: $_('modal.listInfo.title'),

			value: {
				pubkey: pubkey,
				kind: kind,
				title:
					$identifierListsMap?.[pubkey]?.[kind]?.get(
						$identifierKeysArray[$listNum]
					)?.title ?? '',
				image:
					$identifierListsMap?.[pubkey]?.[kind]?.get(
						$identifierKeysArray[$listNum]
					)?.image ?? '',
				description:
					$identifierListsMap?.[pubkey]?.[kind]?.get(
						$identifierKeysArray[$listNum]
					)?.description ?? ''
			},
			// Returns the updated response value
			response: async (res) => {
				console.log(res);
				if (res) {
					if (res.update) {
						$nowProgress = true;
						await updateListInfo(res);
						$nowProgress = false;
					} else if (res.share) {
						//postNoteModalをだす
						openModaltoShare();
					}
				}
			}
		};
		modalStore.trigger(modal);
	}

	async function updateListInfo(res: {
		title: string;
		image: string;
		description: string;
	}) {
		console.log(res);
		const listNumber = $listNum;
		const eventTag = $eventListsMap[pubkey][kind].get(
			$keysArray[listNumber]
		)?.tags;
		if (eventTag) {
			let titleIndex = eventTag.findIndex((item) => item[0] === 'title');
			if (titleIndex !== -1) {
				// すでに "title" タグが存在する場合、値を更新
				eventTag[titleIndex][1] = res.title;
			} else {
				// "title" タグが存在しない場合、配列の二番目（dタグの後ろ）に挿入
				eventTag.splice(1, 0, ['title', res.title]);
				titleIndex = 1;
			}

			let imageIndex = eventTag.findIndex((item) => item[0] === 'image');
			if (imageIndex !== -1) {
				// すでに "title" タグが存在する場合、値を更新
				eventTag[imageIndex][1] = res.image;
			} else {
				// "image" タグが存在しない場合、titleのうしろに挿入
				imageIndex = titleIndex + 1;
				eventTag.splice(imageIndex, 0, ['image', res.image]);
			}

			const descriptionIndex = eventTag.findIndex(
				(item) => item[0] === 'description'
			);
			if (descriptionIndex !== -1) {
				// すでに "title" タグが存在する場合、値を更新
				eventTag[descriptionIndex][1] = res.description;
			} else {
				// "title" タグが存在しない場合、配列の二番目（dタグの後ろ）に挿入
				eventTag.splice(imageIndex + 1, 0, ['description', res.description]);
			}
			console.log(eventTag);
			const event: Nostr.Event = {
				id: '',
				kind: kind,
				pubkey: pubkey,
				content:
					$eventListsMap[pubkey][kind].get($keysArray[listNumber])?.content ??
					'',
				tags: eventTag,
				created_at: Math.floor(Date.now() / 1000),
				sig: ''
			};
			const result = await publishEventWithTimeout(
				event,
				$relaySet[pubkey].bookmarkRelays
			);
			console.log(result);
			if (result.isSuccess && $eventListsMap && result.event) {
				$eventListsMap[pubkey][kind].set($keysArray[listNumber], result.event);
				viewEvent = result.event;
				const t = {
					message: 'Add note<br>' + result.msg,
					timeout: 3000
				};

				toastStore.trigger(t);
			} else {
				const t = {
					message: $_('toast.failed_publish'),
					timeout: 3000,
					background: 'bg-orange-500 text-white width-filled '
				};

				toastStore.trigger(t);
			}
		}
	}

	function openModaltoShare() {
		const listNumber = $listNum;
		//const test = window.location;		console.log(test);
		const address: nip19.AddressPointer = {
			identifier:
				$identifierListsMap[pubkey][kind].get($identifierKeysArray[listNumber])
					?.identifier ?? '',
			pubkey: pubkey,
			kind: kind,
			relays: $relaySet[pubkey].bookmarkRelays
		};

		const url = window.location.origin + '/' + nip19.naddrEncode(address);
		const tags = [listNaddr, ['r', url]];
		console.log(tags);
		const modal: ModalSettings = {
			type: 'component',
			component: postNoteModalComponent,
			title: $_('modal.postNote.title'),
			body: ``,
			value: {
				content: `\r\n${url}\r\n`,
				tags: tags
			},
			response: async (res) => {
				console.log(res);
				//postNoteまでmodalでやるらしい
			}
		};
		modalStore.trigger(modal);
	}

	//-------------------------------イベントJSON表示
	const jsonModalComponent: ModalComponent = {
		ref: ModalEventJson
	};

	const OpenNoteJson = (text: Nostr.Event, tagArray: string[]) => {
		const modal = {
			type: 'component' as const,
			title: 'Event Json',
			backdropClasses: '!bg-surface-400/80',
			meta: {
				note: text,
				tagArray: tagArray
			},

			component: jsonModalComponent
		};
		modalStore.trigger(modal);
	};

	$: selectValue = kind.toString();
	function handleKindChange(event: { currentTarget: HTMLSelectElement }) {
		console.log(Number(event.currentTarget.value));
		console.log(window.location);
		bkm = 'pub';
		goto(`/${nip19.npubEncode(pubkey)}/${selectValue}`);
	}

	const popupFeatured: PopupSettings = {
		// Represents the type of event that opens/closed the popup
		event: 'click',
		// Matches the data-popup value on your popup element
		target: 'popupFeatured',
		// Defines which side of your trigger the popup will appear
		placement: 'bottom-end', //'bottom',
		state: (test) => {
			console.log(test);
			pupupOpen = test.state;
		}
	};
</script>

<div
	class="z-10 fixed h-[4em] top-0 space-x-0 w-full inline-flex flex-row overflow-x-hidden box-border"
>
	<div
		class=" h-[4em] bg-surface-500 text-white container max-w-[1024px] mx-auto grid grid-cols-[auto_1fr_auto_auto_auto] sm:gap-2 gap-0.5 overflow-hidden rounded-b"
	>
		<div class="flex h-full items-center ml-1">
			{#if $relaySet && $relaySet[pubkey] && $relaySet[pubkey].searchRelays && $relaySet[pubkey].searchRelays.length > 0}
				<UserIcon {pubkey} />
			{/if}
		</div>
		<div class="max-w-full overflow-hidden">
			<!-- {#if JSON}【JSON MODE】 kind:{kind}
				{#if kinds[kind]} ({kinds[kind]}) {/if} -->
			{#if !JSON && !nevent}
				<div class="flex max-w-full">
					<select
						class="border rounded border-primary-400 px-1 bg-primary-500 w-fit flex max-w-[85%]"
						bind:value={selectValue}
						on:change={handleKindChange}
						disabled={$nowProgress}
					>
						{#each Object.keys(kinds) as value (value)}
							<option {value}>{`${kinds[Number(value)]} (${value})`}</option>
						{/each}
					</select>
					<!-- {#if pubkey === $pubkey_viewer}
						<span class="fill-white">{@html LocationHomeIcon}</span>
					{/if} -->
				</div>
			{/if}

			{#if $identifierListsMap?.[pubkey]?.[kind]?.get($identifierKeysArray[$listNum])?.identifier}
				<div class="text-xs box-border break-all overflow-x-hidden ml-1">
					{#if kind >= 30000 && kind < 40000 && !JSON}<!-- 30003-->
						{#if !$identifierListsMap[pubkey][kind].get($identifierKeysArray[$listNum])?.title || $identifierListsMap[pubkey][kind].get($identifierKeysArray[$listNum])?.title === ''}
							<button
								class=" flex items-center pt-1 overflow-hidden min-w-[7em] text-left"
								disabled={!(kind >= 30000 && kind < 40000)}
								on:click={listInfoModalOpen}
							>
								<div class=" btn-icon btn-icon-sm fill-white place-self-center">
									{@html infoIcon}
								</div>
								<div class="h4">
									{$identifierListsMap[pubkey][kind].get(
										$identifierKeysArray[$listNum]
									)?.identifier}
								</div>
							</button>
						{:else}
							<button
								class="grid grid-cols-[auto_1fr] items-center min-w-[7em] pr-0.5 overflow-hidden truncate"
								on:click={listInfoModalOpen}
							>
								{#if $iconView && $identifierListsMap[pubkey][kind].get($identifierKeysArray[$listNum])?.image}
									<div class=" p-0 btn-icon btn-icon-sm m-0 mr-1 self-start">
										<img
											width={36}
											class="min-w-[36px]"
											alt=""
											src={$identifierListsMap[pubkey][kind].get(
												$identifierKeysArray[$listNum]
											)?.image}
										/>
									</div>
								{:else}
									<div
										class=" btn-icon btn-icon-sm fill-white place-self-center"
									>
										{@html infoIcon}
									</div>
								{/if}

								<div class="grid grid-rows-[auto_1fr] truncate overflow-hidden">
									<div class="place-self-start text-xs p-0">
										{$identifierListsMap[pubkey][kind].get(
											$identifierKeysArray[$listNum]
										)?.identifier}
									</div>

									<div class="h5 truncate place-self-start">
										{$identifierListsMap[pubkey][kind].get(
											$identifierKeysArray[$listNum]
										)?.title}
									</div>
								</div>
							</button>

							<!-- {#if $identifierList[$listNum].description}
					{$identifierList[$listNum].description}
				{/if} -->
						{/if}
					{:else}
						<!---->
						<div class="overflow-x-hidden h4 p-1 truncate">
							{$identifierListsMap[pubkey][kind].get(
								$identifierKeysArray[$listNum]
							)?.identifier}
						</div>
					{/if}
				</div>
			{:else}
				<!---->
				<div class="h5 self-center w-fit break-all ml-1">
					{#if JSON}<div class="h6">【JSON MODE】</div> {/if}kind:{kind}
					{#if kinds[kind]} ({kinds[kind]}) {/if}
				</div>
			{/if}
		</div>
		<div class="grid grid-cols-[auto_auto] py-0 h-[4em]">
			<div class="flex">
				<button
					title="Public List (tags)"
					class={bkm === 'pub' ? borderClassActive : borderClass}
					disabled={bkm === 'pub'}
					on:click={() => {
						bkm = 'pub';
						console.log(bkm);
						$pageNum = 0;
					}}
					>{@html pubIcon}
				</button>
			</div>
			{#if viewEvent && viewEvent.content !== ''}
				<div class="flex">
					<button
						title="Private List (content)"
						class={bkm === 'prv' ? borderClassActive : borderClass}
						disabled={bkm === 'prv'}
						on:click={() => {
							bkm = 'prv';
							console.log(bkm);
							$pageNum = 0;
						}}
					>
						{@html prvIcon}
					</button>
				</div>
			{:else}
				<div />
			{/if}
		</div>
		{#if viewEvent !== undefined}
			<div class="ml-1 grid grid-rows-[auto_auto] box-border h-[4em]">
				<div class=" place-self-end h6 truncate overflow-hidden">
					{$_('created_at')}
				</div>

				<button
					class="flex text-right text-sm underline decoration-secondary-200 overflow-hidden"
					on:click={() => {
						if (viewEvent !== undefined) {
							OpenNoteJson(viewEvent, listNaddr);
						}
					}}
				>
					<div class="break-all truncate h6">
						{formatAbsoluteDate(viewEvent.created_at)}
					</div></button
				>
			</div>
		{/if}
		<button
			class="btn p-1 fill-white grid grid-rows-[auto_auto]"
			use:popup={popupFeatured}
		>
			<div class="relayIcon flex justify-self-center">{@html RelayIcon}</div>
			{ongoingCount}/
			{readTrueArray?.length}
		</button>

		<!-- <button
			class={'btn p-0 pr-2  arrow  h-[4em]'}
			disabled={$nowProgress}
			on:click={async () => {
				$nowProgress = true;
				await updateBkmTag(pubkey, kind, $listNum);
				$nowProgress = false;
			}}>{@html updateIcon}</button
		> -->
	</div>
</div>

<div
	class="z-[100] fixed left-1/2 -translate-x-1/2 overflow-x-hidden box-border"
>
	<div data-popup="popupFeatured" class="z-[100] sticky">
		{#if pupupOpen}
			<div class="card p-4 w-72 shadow-xl z-[100]">
				<div>
					<p>relays state</p>
					<RelayStateIcon bind:readTrueArray />
				</div>

				<div class="arrow bg-surface-100-800-token" />
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.relayIcon svg) {
		width: 1.2em;
		height: 1.2em;
	}

	:global(.test svg) {
		width: 1.2em;
		height: 1.2em;
	}
	@media screen and (max-width: 600px) {
		:global(.test svg) {
			width: 0.5em; /* 小さいサイズに変更 */
			height: 0.5em; /* 小さいサイズに変更 */
		}
	}
</style>
