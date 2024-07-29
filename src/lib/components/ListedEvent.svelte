<script lang="ts">
	import { _ } from 'svelte-i18n';

	import ModalPostNote from '$lib/components/modals/ModalPostNote.svelte';
	import DeleteIcon from '@material-design-icons/svg/round/delete.svg?raw';
	import DescriptionIcon from '@material-design-icons/svg/round/description.svg?raw';
	import MoveIcon from '@material-design-icons/svg/round/arrow_circle_right.svg?raw';
	import OpenIcon from '@material-design-icons/svg/round/open_in_browser.svg?raw';
	import ShareIcon from '@material-design-icons/svg/round/chat.svg?raw';
	import EditIcon from '@material-design-icons/svg/round/edit_note.svg?raw';
	import CopyIcon from '@material-design-icons/svg/round/content_copy.svg?raw';
	import { page } from '$app/stores';
	import { nip19, type Event as NostrEvent } from 'nostr-tools';
	import {
		getIdByTag,
		nip04De,
		parseNaddr,
		urlParam,
		windowOpen
	} from '$lib/nostrFunctions';
	import ModalEventJson from '$lib/components/modals/ModalEventJson.svelte';
	import { amount, pageNum, listSize } from '$lib/stores/pagination';
	import { MultiMenu, isMulti, nowProgress } from '$lib/stores/settings';
	//import MenuButtons2 from './MenuButtons2.svelte';

	// import Menu from '@material-design-icons/svg/round/more_vert.svg?raw';

	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	import { modalStore, toastStore } from '$lib/stores/store';
	import { dndzone } from 'svelte-dnd-action';
	import {
		ListBox,
		ListBoxItem,
		type ModalComponent,
		type PopupSettings,
		type ModalSettings
	} from '@skeletonlabs/skeleton';
	import EventandButtons from './EventandButtons.svelte';

	import {
		copyNaddr,
		copyNoteId,
		copyRelayURL,
		type SelectIndex
	} from '$lib/otherFunctions';
	import { getRelaysById } from '$lib/streamEventLists';
	import { afterNavigate } from '$app/navigation';

	export let DeleteNote: (e: {
		detail: { number: number; event: any; tagArray: any };
	}) => void;
	export let MoveNote: (e: {
		detail: { number: number; event: any; tagArray: any };
	}) => void;
	export let CheckNote: (e: {
		detail: { number: number; event: any; tagArray: any };
	}) => void;

	export let listEvent: NostrEvent | undefined;
	export let bkm = 'pub'; //'pub'|'prv'
	export let isOwner: boolean;
	//export let noEdit: boolean = false;
	export let pubkey: string;
	export let isNaddr: boolean;
	//moveができるのはparamsがnpub/kindのときだけ
	//deleteができるのはparamsがnpub/kindかnaddr
	//deleteができないものはeditもできない
	// console.log($page.params.hasOwnProperty('npub'));
	// console.log(
	// 	$page.params.hasOwnProperty('npub') || $page.params.hasOwnProperty('naddr')
	// );

	let selectedIndex: SelectIndex = {
		detail: {
			number: 0,
			event: undefined,
			tagArray: []
		}
	};
	//console.log(bkm);

	const privateList = async (list: NostrEvent) => {
		if (list.content !== '') {
			//	try {
			const decypt = await nip04De(list.pubkey, list.content);
			return JSON.parse(decypt);

			//		} catch (error) {
			//			console.error('復号失敗');

			//		return [];
			//	}
		} else {
			//console.log('プライベートブクマなんもないよ');
			return [];
		}
	};
	//export let size: number = 0;
	//export let pageNum = 0;
	//export let amount = 50;
	export let viewList: string[][] = [];

	$: if (bkm !== 'prv' && listEvent) {
		viewUpdate();
	}
	$: if (bkm) {
		viewUpdate();
	} else {
		viewList = [];
		$listSize = 0;
	}
	//$: console.log($listSize);
	let message: string;

	export async function viewUpdate() {
		message = '';
		//	console.log(bkm);
		if (!listEvent) {
			$listSize = 0;
			viewList = [];
			return;
		}

		if (bkm === 'pub') {
			$listSize = listEvent.tags.length;
			viewList = listEvent.tags;
		} else if (isOwner && listEvent.content.includes('?iv=')) {
			try {
				const res = await privateList(listEvent);
				$listSize = res.length;
				viewList = res;
			} catch (error) {
				$listSize = 0;
				viewList = [];
				message = listEvent.content;
			}
		} else {
			$listSize = 0;
			viewList = [];
			message = listEvent.content;
		}
	}
	//	$: console.log($listSize, $amount, $pageNum);

	$: viewPage = viewList.slice(
		Math.min($pageNum, Math.floor($listSize / $amount)) * $amount,
		($pageNum + 1) * Math.min($amount, $listSize)
	);

	const dispatch = createEventDispatcher();
	function handleClickEdit(myIndex: number, tagArray: string[]) {
		dispatch('EditTag', {
			number: myIndex,
			tagArray: tagArray
		});
	}
	let isSortEditing;
	function handleDndConsider(e: {
		detail: { items: { id: number; name: string[] }[] };
	}) {
		items = e.detail.items;
	}
	function handleDndFinalize(e: {
		detail: { items: { id: number; name: string[] }[] };
	}) {
		console.log(e.detail.items);
		items = e.detail.items;
		if (items !== items_original) {
			isSortEditing = true;
		} else {
			isSortEditing = false;
		}
	}

	// Convert emojiData to the desired format
	$: items_original = viewPage?.map((item, index) => {
		return {
			id: index,
			name: item
		};
	});
	$: items = items_original;

	export function resetItems(): void {
		items = items_original;
	}
	export function getSortedTags(): string[][] {
		const sorted = [...viewList];
		console.log(sorted);
		const sortedPage = items.map((item, index) => {
			return item.name;
		});

		const startIndex = $pageNum * $amount;
		const endIndex = Math.min(startIndex + $amount, sorted.length);
		console.log($pageNum, startIndex, endIndex);
		sorted.splice(startIndex, endIndex - startIndex, ...sortedPage);

		return sorted;
	}
	//スマホだとスクロールのドラッグとかぶるから…
	$: dadClass = $isMulti === MultiMenu.Sort ? 'md:mr-0 mr-6 ' : '';

	let comboboxValue: string = '';
	let popupElement: HTMLDivElement;

	const popupCombobox: PopupSettings = {
		event: 'click',
		target: 'popupCombobox',
		placement: 'bottom',
		closeQuery: '.listbox-item',

		state: (test) => {
			//	console.log(test);

			if (!test.state) {
				comboboxValue = '';
				popupElement.style.display = 'none';
				popupElement.style.top = '0';
				popupElement.style.left = '0';
			}
		}
	};
	const tagArrayAddRelay = (tagArray: string[]) => {
		tagArray[0] === 'e' && tagArray.length < 3;
		const relay = getRelaysById(tagArray[1]);
		if (relay.length > 0) {
			return [...tagArray, relay[0]];
		} else {
			return tagArray;
		}
	};
	//-----------------------------------------------引用ポスト
	const postNoteModalComponent: ModalComponent = {
		ref: ModalPostNote
	};
	function shareNote(selectedIndex: SelectIndex) {
		if (!selectedIndex?.detail) return;
		const tagArray = selectedIndex.detail.tagArray;

		const note = selectedIndex.detail.event;
		const tags = tagArray
			? tagArray[0] === 'e'
				? note?.kind !== 1
					? [[...tagArray, getRelaysById(tagArray[1])[0], 'mention']]
					: [['q', ...tagArray.slice(1), getRelaysById(tagArray[1])[0]]]
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
							? `\r\nnostr:${nip19.neventEncode({
									id: tagArray[1],
									relays: getRelaysById(tagArray[1])
								})}`
							: ''
				}`,
				tags: tags,
				tagArray: tagArrayAddRelay(tagArray),
				kind: note?.kind,
				pubkey: note?.pubkey
			}
		};
		modalStore.trigger(modal);
	}

	//-------------------------------イベントJSON表示
	const jsonModalComponent: ModalComponent = {
		ref: ModalEventJson
	};

	const OpenNoteJson = (selected: SelectIndex) => {
		if (!selected.detail) return;
		const modal = {
			type: 'component' as const,
			title: 'Details',
			backdropClasses: '!bg-surface-400/80',
			meta: {
				note: selected.detail.event,
				tagArray: selected.detail.tagArray
			},

			component: jsonModalComponent
		};
		modalStore.trigger(modal);
	};

	let showText: boolean = false;
	let isMount = false;

	onMount(() => {
		console.log('ListedEvent onMount');
		showText = false;
		if (!isMount) {
			isMount = true;
			init();
		}
	});
	afterNavigate(() => {
		console.log('ListedEvent afterNavigate');
		showText = false;
		if (!isMount) {
			isMount = true;
			init();
		}
	});
	let timeoutId: NodeJS.Timeout | undefined;

	function init() {
		timeoutId = setTimeout(() => {
			showText = true;
			isMount = false;
		}, 1000); // 1秒後に表示(初回読み込み時にデータがぶあーってきたときに一瞬だけ表示されたページのイベントの読み込みが発生しないようにしてみる)

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId); // ページが変わった場合にタイマーをクリア
			}
		};
	}
	onDestroy(() => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	});
</script>

{#if showText}
	<div class=" relative">
		{#if viewPage && viewPage.length > 0}
			<section
				use:dndzone={{
					items,
					//flipDurationMs,
					dropTargetStyle: {},
					dragDisabled:
						$isMulti === MultiMenu.Sort && !$nowProgress ? false : true,
					morphDisabled: true,
					dropFromOthersDisabled: true,
					centreDraggedOnCursor: false
				}}
				on:consider={handleDndConsider}
				on:finalize={handleDndFinalize}
				class={dadClass}
				on:touchmove|nonpassive={(e) => {
					//console.log(e);
					$isMulti === MultiMenu.Sort ? e.preventDefault() : '';
				}}
			>
				{#each items as tag (tag.id)}
					<div>
						{#await getIdByTag(tag.name)}
							<!--loading a タグ　のなかみ-->
							<div class="z-0 card drop-shadow px-1 py-1 my-0.5">
								{tag.name}
							</div>
						{:then { id, filter, kind }}
							{#if tag.name[0] === 'd' || tag.name[0] === 'title' || tag.name[0] === 'image' || tag.name[0] === 'description'}
								<!--なんもしない-->
							{:else}
								<!-- ノート | ボタン群-->
								<EventandButtons
									{id}
									{tag}
									{popupCombobox}
									{pubkey}
									{isOwner}
									{filter}
									bind:selectedIndex
									{kind}
									{CheckNote}
								/>
							{/if}
						{/await}
					</div>
				{/each}
			</section>
		{:else if message}
			<p class="h5 font-bold">【List's content】</p>
			<div class="break-all whitespace-break-spaces">{message}</div>
		{/if}

		<div
			bind:this={popupElement}
			class="absolute card w-48 shadow-xl py-2 border border-primary-400-500-token z-[51]"
			data-popup="popupCombobox"
		>
			<ListBox
				rounded="rounded-none"
				class="fill-black dark:fill-white "
				active="variant-filled-primary"
			>
				{#if selectedIndex?.detail?.editable}<ListBoxItem
						name="medium"
						value="edit"
						disabled={!$page.params.hasOwnProperty('npub') &&
							!$page.params.hasOwnProperty('naddr')}
						bind:group={comboboxValue}
						on:click={() => {
							comboboxValue = '';
							handleClickEdit(
								selectedIndex.detail.number,
								selectedIndex.detail.tagArray
							);
							//atodekaku ←？
						}}
						><svelte:fragment slot="lead">{@html EditIcon}</svelte:fragment
						>Edit</ListBoxItem
					>{/if}
				<ListBoxItem
					disabled={!$page.params.hasOwnProperty('npub') ||
						!isOwner ||
						!listEvent?.kind ||
						listEvent?.kind < 30000 ||
						listEvent?.kind >= 40000 ||
						isNaddr}
					value="Move"
					bind:group={comboboxValue}
					name="medium"
					on:click={() => {
						comboboxValue = '';
						MoveNote(selectedIndex);
					}}
					><svelte:fragment slot="lead">{@html MoveIcon}</svelte:fragment>Move
				</ListBoxItem>
				<ListBoxItem
					disabled={(!$page.params.hasOwnProperty('npub') &&
						!$page.params.hasOwnProperty('naddr')) ||
						!isOwner}
					name="medium"
					value="Delete"
					bind:group={comboboxValue}
					on:click={() => {
						comboboxValue = '';
						DeleteNote(selectedIndex);
					}}
					><svelte:fragment slot="lead">{@html DeleteIcon}</svelte:fragment
					>Delete</ListBoxItem
				>
				<hr class="!border-dashed" />
				<ListBoxItem
					name="medium"
					value="Share"
					bind:group={comboboxValue}
					on:click={() => {
						comboboxValue = '';
						shareNote(selectedIndex);
					}}
					><svelte:fragment slot="lead">{@html ShareIcon}</svelte:fragment>Share
					on Nostr</ListBoxItem
				>

				<ListBoxItem
					name="medium"
					disabled={!selectedIndex?.detail ||
						(!selectedIndex.detail.event &&
							selectedIndex.detail.tagArray.length > 0 &&
							selectedIndex.detail.tagArray[1].length !== 64)}
					value="Open"
					bind:group={comboboxValue}
					on:click={() => {
						comboboxValue = '';
						//atagでもイベント取得できてるときはそのイベントのIDをIDにセットしてる。見つかってないときだけtagArrayからつかってる
						const id =
							selectedIndex?.detail && selectedIndex.detail.event
								? selectedIndex.detail.event.id
								: selectedIndex.detail.tagArray[1].length === 64
									? selectedIndex.detail.tagArray[1]
									: '';
						const relays = getRelaysById(id);
						//URLはaタグのときはnaddrにしてみる
						const url = urlParam(selectedIndex.detail.tagArray, relays);
						if (url) {
							console.log(url);
							console.log(relays);
							windowOpen(url);
						}
					}}
					><svelte:fragment slot="lead">{@html OpenIcon}</svelte:fragment>Open
					in njump</ListBoxItem
				>
				<hr class="!border-dashed" />
				<!--naddrがあったらnaddrボタンだけ表示にする？（ノートIDは詳細表示からもコピーできるので）-->
				{#if selectedIndex?.detail && (selectedIndex.detail.tagArray[0] === 'a' || (selectedIndex.detail.event && selectedIndex.detail.event.kind >= 10000 && selectedIndex.detail.event.kind < 40000))}
					<ListBoxItem
						name="medium"
						value="copyNaddr"
						bind:group={comboboxValue}
						on:click={async () => {
							comboboxValue = '';
							const res = await copyNaddr(selectedIndex);
							const toast = res
								? {
										message: `copied`,
										timeout: 3000
									}
								: {
										message: `failed`,
										timeout: 3000,
										background: 'bg-orange-500 text-white width-filled '
									};
							toastStore.trigger(toast);
						}}
						><svelte:fragment slot="lead">{@html CopyIcon}</svelte:fragment>Copy
						Naddr</ListBoxItem
					>{:else if selectedIndex?.detail && (selectedIndex.detail.tagArray[0] === 'e' || selectedIndex.detail.tagArray[0] === 'a')}
					<ListBoxItem
						name="medium"
						value="copyNote"
						bind:group={comboboxValue}
						on:click={async () => {
							comboboxValue = '';
							const res = await copyNoteId(selectedIndex);
							const toast = res
								? {
										message: `copied`,
										timeout: 3000
									}
								: {
										message: `failed`,
										timeout: 3000,
										background: 'bg-orange-500 text-white width-filled '
									};
							toastStore.trigger(toast);
						}}
						><svelte:fragment slot="lead">{@html CopyIcon}</svelte:fragment>Copy
						NoteID</ListBoxItem
					>{/if}

				{#if selectedIndex?.detail && (selectedIndex.detail.tagArray[0] === 'r' || selectedIndex.detail.tagArray[0] === 'relay')}
					<!--wssでもhttpでも-->
					<ListBoxItem
						name="medium"
						value="relay"
						bind:group={comboboxValue}
						on:click={async () => {
							comboboxValue = '';
							const res = await copyRelayURL(selectedIndex);
							const toast = res
								? {
										message: `copied`,
										timeout: 3000
									}
								: {
										message: `failed`,
										timeout: 3000,
										background: 'bg-orange-500 text-white width-filled '
									};
							toastStore.trigger(toast);
						}}
						><svelte:fragment slot="lead">{@html CopyIcon}</svelte:fragment>Copy
						URL</ListBoxItem
					>{/if}<ListBoxItem
					name="medium"
					value="detail"
					bind:group={comboboxValue}
					on:click={() => {
						comboboxValue = '';
						OpenNoteJson(selectedIndex);
					}}
					><svelte:fragment slot="lead">{@html DescriptionIcon}</svelte:fragment
					>View Detail</ListBoxItem
				>
			</ListBox>
			<div class="arrow bg-primary-400-500-token" />
			<!-- <div class="arrow bg-surface-100-800-token border" /> -->
		</div>
	</div>
{/if}
