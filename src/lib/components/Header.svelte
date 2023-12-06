<script lang="ts">
	import { publishEventWithTimeout } from '$lib/nostrFunctions';
	import {
		eventListsMap,
		identifierKeysArray,
		identifierListsMap,
		keysArray,
		listNum,
		relayState
	} from '$lib/stores/bookmarkEvents';
	import { pageNum } from '$lib/stores/pagination';
	import { iconView, nowProgress } from '$lib/stores/settings';
	// import PrvBkm from './Button/PrvBkm.svelte';
	// import PubBkm from './Button/PubBkm.svelte';
	import { prvIcon } from '$lib/components/icons';
	import { pubIcon } from '$lib/components/icons';
	import DeleteIcon from '@material-design-icons/svg/round/delete.svg?raw';
	import MoveIcon from '@material-design-icons/svg/round/arrow_circle_right.svg?raw';
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
	import { get } from 'svelte/store';
	import { afterUpdate } from 'svelte';
	import RelayStateIcon from './RelayStateIcon.svelte';

	export let bkm: string;
	export let kind: number;
	export let pubkey: string;
	export let viewEvent: Nostr.Event<number> | undefined;
	export let JSON: boolean = false;

	let ongoingCount: number;
	let relayStateSize: number;
	$: console.log($storePopup.popupFeatured);
	$: console.log(popupFeatured.state);
	let pupupOpen: boolean = false;

	$: console.log(pupupOpen);

	afterUpdate(() => {
		console.log('[relay state]', get(relayState));
		ongoingCount =
			get(relayState).size > 0
				? Array.from(get(relayState).values()).filter(
						(state) => state === 'ongoing'
				  ).length
				: 0;

		relayStateSize = $relayState.size;
	});

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
	const borderClassActive = `break-keep border-b-2 border-white place-items-end  flex m-1 p-0.5 pb-0 h6 bkm`;
	const borderClass = `break-keep  place-items-end p-0.5 flex m-1 h6 bkm`;

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

			value: { pubkey: pubkey },
			// Returns the updated response value
			response: async (res) => {
				console.log(res);
				if (res) {
					if (res.update) {
						$nowProgress = true;
						await updateListInfo(res);
						$nowProgress = true;
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

		goto(`/${nip19.npubEncode(pubkey)}/${selectValue}`);
	}

	const popupFeatured: PopupSettings = {
		// Represents the type of event that opens/closed the popup
		event: 'click',
		// Matches the data-popup value on your popup element
		target: 'popupFeatured',
		// Defines which side of your trigger the popup will appear
		placement: 'bottom',
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
		class=" h-[4em] bg-surface-500 text-white container max-w-[1024px] mx-auto grid grid-cols-[1fr_auto_auto_auto] gap-2 overflow-hidden rounded-b"
	>
		<div>
			<!-- {#if JSON}【JSON MODE】 kind:{kind}
				{#if kinds[kind]} ({kinds[kind]}) {/if} -->
			{#if !JSON}
				<select
					class="border rounded border-primary-400 bg-primary-700 px-1 bg-primary-500 w-fit"
					bind:value={selectValue}
					on:change={handleKindChange}
					disabled={$nowProgress}
				>
					{#each Object.keys(kinds) as value (value)}
						<option {value}>{`${kinds[Number(value)]} (${value})`}</option>
					{/each}
				</select>
			{/if}

			{#if $identifierListsMap?.[pubkey]?.[kind]?.get($identifierKeysArray[$listNum])?.identifier}
				<div class="text-xs">
					{#if kind === 30003 && !JSON}
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
						<div class=" h4 p-1">
							{$identifierListsMap[pubkey][kind].get(
								$identifierKeysArray[$listNum]
							)?.identifier}
						</div>
					{/if}
				</div>
			{:else}
				<!---->
				<div class="h5 self-center w-fit break-all">
					{#if JSON}<div class="h6">【JSON MODE】</div> {/if}kind:{kind}
					{#if kinds[kind]} ({kinds[kind]}) {/if}
				</div>
			{/if}
		</div>
		<div class="grid grid-cols-[auto_auto] p-1 h-[4em]">
			<button
				class={bkm === 'pub' ? borderClassActive : borderClass}
				disabled={bkm === 'pub'}
				on:click={() => {
					bkm = 'pub';
					console.log(bkm);
					$pageNum = 0;
				}}
				>{@html pubIcon}
			</button>
			{#if viewEvent && viewEvent.content !== ''}
				<button
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
			{:else}
				<div />
			{/if}
		</div>
		{#if viewEvent !== undefined}
			<div class=" grid grid-rows-[auto_auto] box-border h-[4em]">
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
					<div class="truncate h6">
						{new Date(viewEvent.created_at * 1000).toLocaleDateString([], {
							year: 'numeric',
							month: '2-digit',
							day: '2-digit',
							hour: '2-digit',
							minute: '2-digit'
						})}
					</div></button
				>
			</div>
		{/if}
		<button class="btn p-2 fill-white flex" use:popup={popupFeatured}>
			{@html RelayIcon}
			<div>
				{ongoingCount}/
				{relayStateSize}
			</div></button
		>

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
<div data-popup="popupFeatured" class="z-[100]">
	{#if pupupOpen}
		<div class="card p-4 w-72 shadow-xl z-[100]">
			<div>
				<p>relays state</p>
				<RelayStateIcon />
			</div>

			<div class="arrow bg-surface-100-800-token" />
		</div>
	{/if}
</div>
