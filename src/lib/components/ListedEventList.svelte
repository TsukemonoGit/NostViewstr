<script lang="ts">
	import { _ } from 'svelte-i18n';
	import addIcon from '@material-design-icons/svg/round/bookmark_add.svg?raw';

	import ListedEvent from '$lib/components/ListedEvent.svelte';
	//import { listEvent } from '$lib/testData/list';
	import {
		bookmarkEvents,
		checkedIndexList,
		identifierList,
		listNum,
		type Identifiers
	} from '$lib/stores/bookmarkEvents';
	import {
		StoreFetchFilteredEvents,
		addPrivates,
		deletePrivates,
		deletePubs,
		fetchFilteredEvents,
		getPub,
		getRelays,
		isOneDimensionalArray,
		publishEventWithTimeout,
		setRelays,
		updateBkmTag
	} from '$lib/nostrFunctions';
	import { afterUpdate, onMount } from 'svelte';

	import DeleteIcon from '@material-design-icons/svg/round/delete.svg?raw';
	import MoveIcon from '@material-design-icons/svg/round/arrow_circle_right.svg?raw';

	import {
		initRelaySet,
		// searchRelays,
		// postRelays,
		// bookmarkRelays,
		// relayPubkey
		relaySet
	} from '$lib/stores/relays';
	import {
		iconView,
		isMulti,
		nowProgress,
		pubkey_viewer
	} from '$lib/stores/settings';
	//import type { Event } from 'nostr-tools';
	import { amount, listSize, pageNum } from '$lib/stores/pagination';
	import {
		ListBox,
		ListBoxItem,
		type ModalComponent,
		type ModalSettings,
		type ToastSettings
	} from '@skeletonlabs/skeleton';
	import ModalAddNote from '$lib/components/modals/ModalAddNote.svelte';
	import ModalDelete from '$lib/components/modals/ModalDelete.svelte';
	import ModalMove from '$lib/components/modals/ModalMove.svelte';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { NostrApp, type Nostr } from 'nosvelte';

	import { afterNavigate } from '$app/navigation';
	import Header from './Header.svelte';
	import { kindsValidTag } from '$lib/kind';

	let bkm: string = 'pub';
	let viewEvent: Nostr.Event<number> | undefined;
	export let pubkey: string;
	export let kind: number;
	export let identifier: string | undefined = undefined;
	export let isNaddr: boolean;
	let isOwner: boolean;
	$: console.log($relaySet);
	$: isOwner = $pubkey_viewer === pubkey;
	let isOnMount = false;

	$: if (
		$bookmarkEvents[pubkey] &&
		$bookmarkEvents[pubkey][kind] &&
		$bookmarkEvents[pubkey][kind][$listNum]
	) {
		viewEvent = $bookmarkEvents[pubkey][kind][$listNum];
	} else {
		viewEvent = undefined;
	}
	onMount(async () => {
		if (!isOnMount) {
			console.log('onMount');
			isOnMount = true; // onMountが呼ばれたことを示すフラグを変更
			await init();
			isOnMount = false; // onMountが呼ばれたことを示すフラグを変更
		}
	});

	afterNavigate(async () => {
		if (!isOnMount) {
			console.log('afterNavigate');
			isOnMount = true; // onMountが呼ばれたことを示すフラグを変更
			$listNum = 0;
			$pageNum = 0;
			await init();
			isOnMount = false; // onMountが呼ばれたことを示すフラグを変更
		}
	});
	//ぷぶきーがかわるごとにしょきか？
	// $: if (pubkey) {
	// 	init();
	// }

	const init = async () => {
		$nowProgress = true;
		console.log('onMount executed');
		// if ($pubkey_viewer === '') {
		// 	try {
		// 		const res = await getPub();
		// 		if (res !== '') {
		// 			$pubkey_viewer = res;
		// 		}
		// 	} catch (error) {
		// 		//			$nowProgress = false;
		// 		console.log('failed to login');
		// 	}
		// }

		await bkminit(pubkey);
		$nowProgress = false;
	};

	export async function bkminit(pub: string) {
		$listNum = 0;
		bkm = 'pub';
		console.log('bkminit');

		//console.log(await getRelays(pubkey)); //await setRelays(testRelay);
		if ($pubkey_viewer === undefined || $pubkey_viewer === '') {
			$pubkey_viewer = await getPub();
		}

		console.log($pubkey_viewer);
		//	console.log(pub);
		//if ($bookmarkRelays.length === 0) {

		//パブキーに対するリレーセットが設定されてなかったら取得する（戻るボタンとかで同じユーザーになった場合に省略されるはず）
		//bookmarkEvents.set([]);
		if (!$relaySet || !$relaySet[pub]) {
			// bookmarkRelays.set([]);
			// postRelays.set([]);
			// searchRelays.set([]);
			const t: ToastSettings = {
				message: `${$_('toast.relaySearching')}`
			};
			const getRelaysToast = toastStore.trigger(t);
			$relaySet[pub] = initRelaySet;
			await getRelays(pub);
			toastStore.close(getRelaysToast);
			//$relayPubkey = pubkey;
		}
		if (pub !== $pubkey_viewer && !$relaySet[$pubkey_viewer]) {
			$relaySet[$pubkey_viewer] = initRelaySet;
			// bookmarkRelays.set([]);
			// postRelays.set([]);
			// searchRelays.set([]);
			getRelays($pubkey_viewer);
			//$relayPubkey = pubkey;
		}
		//	}
		const filter =
			identifier === undefined
				? [
						{
							kinds: [kind],
							authors: [pub]
						}
				  ]
				: [
						{
							kinds: [kind],
							authors: [pub],
							'#d': [identifier]
						}
				  ];
		//$nowProgress = true;
		const t: ToastSettings = {
			message: `${$_('toast.eventSearching')}`
		};
		const searchingEventsToast = toastStore.trigger(t);
		const res = await StoreFetchFilteredEvents(pubkey, kind, {
			relays: $relaySet[pubkey].bookmarkRelays,
			filters: filter
		});
		toastStore.close(searchingEventsToast);
		//console.log(res);
		//const res = bookmarks;
		// if (res.length === 0) {
		// 	console.log('bookmark not found');
		// 	return;
		// }
		// res.sort((a, b) => {
		// 	const tagID_A = a.tags[0][1];
		// 	const tagID_B = b.tags[0][1];
		// 	return tagID_A.localeCompare(tagID_B);
		// });
		// $bookmarkEvents = res;
		// //viewEvent = $bookmarkEvents[0];
		// //	$nowProgress = false;
		// console.log(res);
	}

	//リストが変わったら1ページ目に戻す
	$: if ($listNum !== -1 && typeof window !== 'undefined') {
		$isMulti = false;
		$pageNum = 0;
		$checkedIndexList = [];
		bkm = 'pub';
		window.scrollTo({ top: 0 });
	}
	//ページが変わったらチェックリスト空にする
	$: if (($pageNum !== -1 || bkm) && typeof window !== 'undefined') {
		$checkedIndexList = [];
		window.scrollTo({ top: 0 });
	}
	// $: listNaddr = viewEvent
	// 	? [
	// 			'a',
	// 			`${viewEvent.kind}:${viewEvent.pubkey}:${
	// 				$identifierList[$listNum].identifier ?? ''
	// 			}`
	// 	  ]
	// 	: [];
	//---------------------------------------------delete?modal
	const deleteModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalDelete,
		// Add the component properties as key/value pairs
		//props: { background: 'bg-red-500' },
		// Provide a template literal for the default component slot
		slot: '<p>Skeleton</p>'
	};

	async function DeleteNote(e: CustomEvent<any>) {
		console.log('DeleteNote');
		const number: number = e.detail.number + $pageNum * $amount;
		const listNumber = $listNum;
		console.log(number);

		//ほんとに消すのか出す
		const modal: ModalSettings = {
			type: 'component',
			component: deleteModalComponent,
			title: $_('modal.deleteNote.title'),
			body: `${$_('modal.deleteNote.body')}`,
			value: {
				event: [e.detail.event],
				tag: e.detail.tagArray
			},
			response: async (res) => {
				//console.log(res);
				if (res) {
					$nowProgress = true;
					await deleteNotesfromLists(listNumber, [number]);
					$nowProgress = false;
					//    deleteNoteIndexes = [];
				} else {
					//  deleteNoteIndexes = [];
				}
			}
		};
		modalStore.trigger(modal);
	}

	async function deleteNotesfromLists(listNumber: number, numList: number[]) {
		console.log(numList);
		if ($bookmarkEvents) {
			//$nowProgress = true;

			await updateBkmTag(pubkey, kind, listNumber); //最新の状態に更新
			try {
				const bkmk = $bookmarkEvents[pubkey][kind][listNumber];

				const event: Nostr.Event = {
					id: '',
					pubkey: bkmk.pubkey,
					created_at: Math.floor(Date.now() / 1000),
					kind: bkmk.kind,
					tags: bkm === 'pub' ? deletePubs(bkmk.tags, numList) : bkmk.tags, //bkmk.tags.splice(number, 1) : bkmk.tags,
					content:
						bkm === 'pub'
							? bkmk.content
							: await deletePrivates(bkmk.content, bkmk.pubkey, numList), //ここでエラーの可能性ある
					sig: ''
				};
				const result = await publishEventWithTimeout(
					event,
					$relaySet[pubkey].bookmarkRelays
				);
				//   console.log(result);
				if (result.isSuccess && $bookmarkEvents && result.event) {
					$bookmarkEvents[pubkey][kind][listNumber] = result.event;
					viewEvent = $bookmarkEvents[pubkey][kind][listNumber];
					const t = {
						message: 'Delete note<br>' + result.msg,
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
			} catch (error) {
				const t = {
					message: $_('toast.failed_publish'),
					timeout: 3000,
					background: 'bg-orange-500 text-white width-filled '
				};

				toastStore.trigger(t);
			}
		}
		$checkedIndexList = [];
		$isMulti = false;
	}

	//---------------------------------------------move
	const moveModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalMove
	};
	function MoveNote(e: CustomEvent<any>): void {
		console.log('MoveNote');
		const number: number = e.detail.number + $pageNum * $amount;
		console.log(number);
		console.log(e.detail.event);
		console.log(e.detail.tagArray);
		const listNumber = $listNum;
		const _bkm = bkm;
		//どこに移動させるのか画面を出す。
		const modal: ModalSettings = {
			type: 'component',
			component: moveModalComponent,
			title: $_('modal.moveNote.title'),
			body: `${$_('modal.moveNote.body_from')} ${
				$identifierList[pubkey][kind][listNumber].identifier
			}[${_bkm === 'pub' ? $_('public') : $_('private')}] ${$_(
				'modal.moveNote.body_to'
			)}`,
			value: {
				bkm: _bkm,
				tag: listNumber,
				kind: kind,
				pubkey: pubkey
			},
			response: async (res) => {
				//console.log(res);
				if (res) {
					$nowProgress = true;
					await moveNoteSuruyatu(
						[number],
						[e.detail.tagArray],
						{ tag: listNumber, bkm: _bkm },
						{ tag: res.tag, bkm: res.bkm }
					);
					$nowProgress = false;
				}
			}
		};
		modalStore.trigger(modal);
	}

	function CheckNote(e: CustomEvent<any>): void {
		console.log(e);
		console.log('CheckNote');
		const number: number = e.detail.number + $pageNum * $amount;
		//console.log(e.detail.checked, number);
		console.log($checkedIndexList);
	}

	//--------------------------------------Add note
	const addModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalAddNote,
		// Add the component properties as key/value pairs
		props: { background: 'bg-red-500' },
		// Provide a template literal for the default component slot
		slot: '<p>Skeleton</p>'
	};

	function onClickAdd() {
		//あどもだるをひらく
		const modal: ModalSettings = {
			type: 'component',
			// // Pass the component directly:
			component: addModalComponent,
			// Provide arbitrary metadata to your modal instance:
			title:
				$identifierList[pubkey][kind] &&
				$identifierList[pubkey][kind][$listNum] &&
				$identifierList[pubkey][kind][$listNum].identifier
					? $identifierList[pubkey][kind][$listNum].identifier
					: `kind:${kind}`,

			body: '',
			value: { kind: kind, pubkey: pubkey, event: $bookmarkEvents[$listNum] },
			response: async (res: { btn: string; tag: string[] }) => {
				console.log(res); //有効だったらタグになって帰ってきてほしい
				$nowProgress = true;
				await addNotesuruyatu(res);
				$nowProgress = false;
			}
		};
		modalStore.trigger(modal);
	}

	async function addNotesuruyatu(res: { btn: string; tag: string[] }) {
		console.log(res);
		if (res) {
			const listNumber = $listNum;
			/* 	let check: { tag?: string[]; error: boolean; message?: string } = {
				error: false
			};

			//$nowProgress = true;
			let noteID = res.value;

			//まず追加するタグを作る（checkにいれる）
			//ポストkind1 ノート
			if (res.create) {
				const event: Nostr.Event<any> = {
					id: '',
					pubkey: pubkey,
					created_at: Math.floor(Date.now() / 1000),
					kind: 1,
					tags: [],
					content: res.value,
					sig: ''
				};
				console.log($postRelays);
				if ($postRelays.length > 0) {
					const response = await publishEventWithTimeout(event, $postRelays);
					if (response.isSuccess) {
						const t = {
							message: response.msg,
							timeout: 3000
						};

						toastStore.trigger(t);

						if (response.event) {
							noteID = response.event.id; //追加するノートIDがこれ
						} else {
							const t = {
								message: 'failed to publish',
								timeout: 3000,
								background: 'bg-orange-500 text-white width-filled '
							};
							toastStore.trigger(t);
							//		$nowProgress = false;
							return;
						}
					}
				}
			}
			if (res.type === 'id') {
				// check = await checkInput(noteID);
				// if (check.error && check.message) {
				// 	const t = {
				// 		message: check.message,
				// 		timeout: 3000,
				// 		background: 'bg-orange-500 text-white width-filled '
				// 	};

				// 	toastStore.trigger(t);
				// 	//		$nowProgress = false;
				// 	return;
				// }
			} else if (res.type === 'tag') {
				try {
					const tagArray = JSON.parse(res.tagvalue);
					if (!isOneDimensionalArray(tagArray)) {
						throw new Error();
					}
					//タグが大丈夫そうだったらcheckに入れる
					check = { error: false, tag: tagArray };
				} catch (error) {
					const t = {
						message: $_('toast.failed_publish'),
						timeout: 3000,
						background: 'bg-orange-500 text-white width-filled '
					};

					toastStore.trigger(t);
					//		$nowProgress = false;
					return;
				}
			} */
			// //validtagかちぇっく
			// if (!check.tag || !kindsValidTag[kind].includes(check.tag[0])) {
			// 	const t = {
			// 		message: $_('toast.invalidtag'),
			// 		timeout: 3000,
			// 		background: 'bg-orange-500 text-white width-filled '
			// 	};

			// 	toastStore.trigger(t);
			// 	return;
			// }
			//idのチェックが終わったのでcheck.tagを入れる
			// if (check && check.error && check.message) {
			// 	const t = {
			// 		message: check.message,
			// 		timeout: 3000,
			// 		background: 'bg-orange-500 text-white width-filled '
			// 	};

			// 	toastStore.trigger(t);
			// 	//$nowProgress = false;
			// 	return;
			// } else if (check.tag && check.tag.length > 0 && $bookmarkEvents) {
			console.log($bookmarkEvents[pubkey][kind][listNumber]);
			if ($bookmarkEvents[pubkey][kind][listNumber] !== undefined) {
				// 	console.log($bookmarkEvents[pubkey][kind][listNumber]);
				await updateBkmTag(pubkey, kind, listNumber); //最新の状態に更新
			}
			await addNotesToLists(listNumber, res.btn, [res.tag], pubkey, kind);
			$nowProgress = false;
		}
		//}
	}

	async function addNotesToLists(
		listNumber: number,
		btn: string,
		idTagList: string[][],
		pubkey: string,
		kind: number
	): Promise<boolean> {
		let isSuccess = false;

		try {
			const bkmk = $bookmarkEvents?.[pubkey]?.[kind]?.[listNumber];

			const tagsToAdd =
				btn === 'pub'
					? bkmk !== undefined
						? [...bkmk.tags, ...idTagList]
						: idTagList
					: bkmk.tags;

			const contentToAdd = async (): Promise<string> => {
				if (btn === 'pub') {
					if (bkmk && bkmk.content) {
						return bkmk.content;
					} else {
						return '';
					}
				} else {
					if (bkmk && bkmk.content) {
						return await addPrivates(bkmk.content, pubkey, idTagList);
					} else {
						return await addPrivates('', pubkey, idTagList);
					}
				}
			};

			const event: Nostr.Event = {
				id: '',
				pubkey: pubkey,
				created_at: Math.floor(Date.now() / 1000),
				kind: kind,
				tags: tagsToAdd,
				content: await contentToAdd(),
				sig: ''
			};

			console.log(event);

			const result = await publishEventWithTimeout(
				event,
				$relaySet[pubkey]?.bookmarkRelays || []
			);

			if (result.isSuccess) {
				const updatedEvent = result.event as Nostr.Event;

				if ($bookmarkEvents) {
					$bookmarkEvents[pubkey] = $bookmarkEvents[pubkey] || {};
					$bookmarkEvents[pubkey][kind] = $bookmarkEvents[pubkey][kind] || [];
					$bookmarkEvents[pubkey][kind][listNumber] = updatedEvent;
					viewEvent = updatedEvent;
				} else {
					$bookmarkEvents = { [pubkey]: { [kind]: [updatedEvent] } };
				}
				//identifierEventも更新する
				const tag = updatedEvent.tags.find((tag) => tag[0] === 'd');
				const title = updatedEvent.tags.find((tag) => tag[0] === 'title');
				const image = updatedEvent.tags.find((tag) => tag[0] === 'image');
				const description = updatedEvent.tags.find(
					(tag) => tag[0] === 'description'
				);
				const newIdentifierList: Identifiers = {
					identifier: tag ? tag[1] : undefined,
					title: title ? title[1] : undefined,
					image: image ? image[1] : undefined,
					description: description ? description[1] : undefined
				};

				if ($identifierList) {
					$identifierList[pubkey] = $identifierList[pubkey] || {};
					$identifierList[pubkey][kind] = $identifierList[pubkey][kind] || [];
					$identifierList[pubkey][kind][listNumber] = newIdentifierList;
				} else {
					$identifierList = { [pubkey]: { [kind]: [newIdentifierList] } };
				}
			}
			const toastMessage = result.isSuccess
				? 'Add note<br>' + result.msg
				: $_('toast.failed_publish');

			const t = {
				message: toastMessage,
				timeout: 3000,
				background: result.isSuccess
					? 'variant-filled-secondary width-filled'
					: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
			isSuccess = result.isSuccess;
		} catch (error) {
			console.error(error);

			const t = {
				message: $_('toast.failed_publish'),
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
		}

		return isSuccess;
	}
	// afterUpdate(() => {
	// 	viewEvent = viewEvent;
	// });

	// let identifier: string;
	// $: if ($bookmarkEvents) {
	// 	const index = $bookmarkEvents[$listNum].tags.find(
	// 		(item) => item[0] === 'd'
	// 	);
	// 	if (index) {
	// 		identifier = index[1];
	// 	} else {
	// 		identifier = ''; // マッチする要素が見つからない場合のデフォルト値
	// 	}
	// 	console.log(identifier);
	// }

	function onClickPage(arg0: number): any {
		$listNum += arg0;
	}

	function onClickMultiMove() {
		const listNumber = $listNum;
		const _bkm = bkm;
		const indexes = $checkedIndexList.map(
			(item) => item.index + $pageNum * $amount
		);
		const tagArrays = $checkedIndexList.map((item) => item.tagArray);
		//どこに移動させるのか画面を出す。
		const modal: ModalSettings = {
			type: 'component',
			component: moveModalComponent,
			title: $_('modal.moveNote.title'),
			body: `${$_('modal.moveNote.body_from')} ${$identifierList[listNumber]}[${
				_bkm === 'pub' ? $_('public') : $_('private')
			}] ${$_('modal.moveNote.body_to')}`,
			value: {
				bkm: _bkm,
				tag: listNumber,
				pubkey: pubkey,
				kind: kind
			},
			response: async (res) => {
				//console.log(res);
				if (res) {
					$nowProgress = true;
					console.log(res.bkm);
					await moveNoteSuruyatu(
						indexes,
						tagArrays,
						{ tag: listNumber, bkm: _bkm },
						{ tag: res.tag, bkm: res.bkm }
					);
					$nowProgress = false;
				}
			}
		};
		modalStore.trigger(modal);
	}

	function onClickMultiDelete() {
		console.log($checkedIndexList);
		//クリックした時点のあれをあれしておく
		const listN = $listNum;
		const indexes = $checkedIndexList.map(
			(item) => item.index + $pageNum * $amount
		);
		console.log(indexes);
		//ほんとに消すのか出す
		const modal: ModalSettings = {
			type: 'component',
			component: deleteModalComponent,
			title: $_('modal.deleteNote.title'),
			body: `${$_('modal.deleteNote.body')}`,
			value: {
				event: $checkedIndexList.map((item) => item.event)
			},
			response: async (res) => {
				//console.log(res);
				if (res) {
					$nowProgress = true;
					await deleteNotesfromLists(listN, indexes);
					$nowProgress = false;
					//    deleteNoteIndexes = [];
				} else {
					//  deleteNoteIndexes = [];
				}
			}
		};
		modalStore.trigger(modal);
		//deleteNotesfromLists(listN,)
	}

	async function moveNoteSuruyatu(
		indexes: number[],
		tags: string[][],
		from: { tag: number; bkm: string },
		to: { tag: number; bkm: string }
	) {
		console.log(
			`list:${from.tag} bkm:${from.bkm} の${indexes}番目のノートをlist:${to.tag}のbkm:${to.bkm}に移動させる`
		);
		if ($bookmarkEvents[pubkey][kind].length > 0) {
			//toの方にaddNoteする。

			await updateBkmTag(pubkey, kind, from.tag); //最新の状態に更新

			const addRes = await addNotesToLists(to.tag, to.bkm, tags, pubkey, kind);
			if (!addRes) {
				//		$nowProgress = false;
				return;
			}
			const deleteRes = await deleteNotesfromLists(from.tag, indexes);
			//		$nowProgress = false;
		}
	}
</script>

<!--header-->
<Header {kind} bind:bkm {pubkey} bind:viewEvent />
<!-- {#await bkminit(pubkey) then bkminti} -->

<!--サイドバーとメイン-->
<div
	class="mb-12 mt-16 container max-w-[1024px] h-full mx-auto justify-center items-center box-border"
>
	<div class="flex overflow-x-hidden">
		<!-- Left Sidebar (Hidden on small screens) -->
		{#if !isNaddr}
			<div
				class="hidden md:flex h-full w-[12em] pb-[6em] bg-surface-200-700-token overflow-y-auto fixed"
			>
				<!-- Your sidebar content goes here -->
				<!-- For example, you can add links or other elements -->
				<!--さいどばー-->
				{#if $identifierList && $identifierList[pubkey] && $identifierList[pubkey][kind]?.length > 0}
					<ListBox
						class=" overflow-y-auto w-full"
						active="variant-ghost-primary box-border"
					>
						{#each $identifierList[pubkey][kind] as list, index}
							<ListBoxItem
								bind:group={$listNum}
								name={list.identifier ?? ''}
								value={index}
								class="truncate "
								padding="px-2 py-2"
								labelledby="truncate"
								on:change={() => {
									$listNum = index;
								}}
								><svelte:fragment slot="lead"
									><div
										class="rounded-full w-[1.5em] h-[1.5em] variant-soft-primary h6 text-center"
									>
										{(index + 1).toString().padStart(2, '0')}
									</div></svelte:fragment
								>
								{#if list.title}
									<div class="text-xs">{list.identifier}</div>
									<div>{list.title}</div>
								{:else}
									{list.identifier}
								{/if}
							</ListBoxItem>
							<hr />
						{/each}
					</ListBox>
					<!-- {:else if !$nowProgress}
					{$_('modal.tagList.noList')} -->
				{/if}
			</div>
		{/if}
		<!--めいん-->
		<main
			class="flex-1 {isNaddr
				? ''
				: 'md:ml-[12em]'} overflow-y-auto h-fit overflow-x-hidden pb-[2em]"
		>
			<!-- Add ml-64 to push main to the right -->
			{#if $relaySet && $relaySet[pubkey] && $relaySet[pubkey].searchRelays && $relaySet[pubkey].searchRelays.length > 0}
				<NostrApp relays={$relaySet[pubkey].searchRelays}>
					<ListedEvent
						listEvent={viewEvent}
						{pubkey}
						{DeleteNote}
						{MoveNote}
						{CheckNote}
						bind:bkm
						bind:isOwner
					/>
				</NostrApp>
				<!-- {:else}
				{`now getting relay list ...`} -->
			{/if}
		</main>
	</div>
</div>

{#if $bookmarkEvents && $bookmarkEvents[pubkey] && $bookmarkEvents[pubkey][kind] && $bookmarkEvents[pubkey][kind].length > 0}
	<!---->
{:else}
	<div class="flex w-full h-full justify-center items-center text-center">
		<!-- Left Sidebar (Hidden on small screens) -->

		{#if $nowProgress}
			{`now loading...`}
		{:else}
			{`no data`}
		{/if}
	</div>
{/if}
<!-------------------------------あど----->
{#if !$nowProgress && $pubkey_viewer === pubkey}
	<div
		class="fixed bottom-14 z-10 box-border overflow-x-hidden {$isMulti
			? 'multi'
			: 'add'}"
	>
		<div class="fill-white overflow-x-hidden h-fit overflow-y-auto">
			{#if !$isMulti}
				<button
					class="addIcon btn-icon variant-filled-secondary fill-white hover:variant-ghost-secondary hover:stroke-secondary-500 overflow-x-hidden"
					on:click={onClickAdd}>{@html addIcon}</button
				>
			{:else}
				<button
					class="addIcon btn-icon variant-filled-secondary fill-white hover:variant-ghost-secondary hover:stroke-secondary-500 overflow-x-hidden"
					on:click={onClickMultiMove}>{@html MoveIcon}</button
				>
				<button
					class="overflow-x-hidden addIcon btn-icon variant-filled-warning fill-white mx-1 hover:variant-ghost-warning hover:stroke-warning-500"
					on:click={onClickMultiDelete}>{@html DeleteIcon}</button
				>
			{/if}
		</div>
	</div>
{/if}

<!-- {/await} -->

<style>
	:global(.addIcon svg) {
		width: 1.5em;
		height: 1.5em;
	}

	:global(.arrow svg) {
		width: 2em;
		height: 2em;
		fill: white;
	}
	:global(.test1 g) {
		width: 2em;
		height: 2em;
		fill: black;
	}
	.add {
		/* コンテナのMAXサイズが1024pxなので半分の512より手前らへんに */
		left: min(calc(50% + 440px), calc(100% - 60px));
		overflow-x: hidden;
	}
	.multi {
		/* コンテナのMAXサイズが1024pxなので半分の512より手前らへんに */
		left: min(calc(50% + 400px), calc(100% - 110px));
		overflow-x: hidden;
	}
	:global(.bkm svg) {
		width: 24px;
		height: 24px;
	}
</style>
