<script lang="ts">
	import { _ } from 'svelte-i18n';
	import addIcon from '@material-design-icons/svg/round/bookmark_add.svg?raw';

	import ListedEvent from '$lib/components/ListedEvent.svelte';
	//import { listEvent } from '$lib/testData/list';
	import {
		//	bookmarkEvents,
		eventListsMap,
		checkedIndexList,
		listNum,
		keysArray,
		identifierListsMap,
		identifierKeysArray
	} from '$lib/stores/bookmarkEvents';
	import {
		addPrivates,
		deletePrivates,
		deletePubs,
		editPrivates,
		getPub,
		getRelays,
		nip04En
	} from '$lib/nostrFunctions';
	import { onMount } from 'svelte';

	import DeleteIcon from '@material-design-icons/svg/round/delete.svg?raw';
	import MoveIcon from '@material-design-icons/svg/round/arrow_circle_right.svg?raw';
	import CancelIcon from '@material-design-icons/svg/round/cancel.svg?raw';
	import DoneIcon from '@material-design-icons/svg/round/done_outline.svg?raw';
	import {
		initRelaySet,
		// searchRelays,
		// postRelays,
		// bookmarkRelays,
		// relayPubkey
		relaySet
	} from '$lib/stores/relays';
	import {
		MultiMenu,
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
	import NostrApp from '$lib/components/nostrData/NostrApp.svelte';
	import type Nostr from 'nostr-typedef';
	import { afterNavigate } from '$app/navigation';
	import Header from './Header.svelte';

	import {
		StoreFetchFilteredEvents,
		publishEventWithTimeout
	} from '$lib/streamEventLists';
	import FooterMenu from './FooterMenu.svelte';
	import { kinds, kindsValidTag } from '$lib/kind';
	import { page } from '$app/stores';
	import { parameterizedReplaceable } from '$lib/otherFunctions';
	import FormatListBulleted from '@material-design-icons/svg/round/format_list_bulleted.svg?raw';

	export let bkm: string = 'pub';
	let viewEvent: Nostr.Event<number> | undefined;
	export let pubkey: string;
	export let kind: number;
	export let identifier: string | undefined = undefined; //naddrのとき
	export let isNaddr: boolean;

	// ListedEventコンポーネントのリファレンスを取得
	let listedEventRef: ListedEvent;

	let isOwner: boolean;
	//$: console.log($relaySet);
	$: isOwner = $pubkey_viewer === pubkey;
	let isOnMount = false;
	// キーのイテレータを配列に変換してすべてのキーを取得
	$: $keysArray =
		$eventListsMap[pubkey] && $eventListsMap[pubkey][kind]
			? Array.from($eventListsMap[pubkey][kind].keys()).sort((a, b) =>
					a.localeCompare(b)
				)
			: [];

	$: $identifierKeysArray =
		$identifierListsMap[pubkey] && $identifierListsMap[pubkey][kind]
			? Array.from($identifierListsMap[pubkey][kind].keys()).sort((a, b) =>
					a.localeCompare(b)
				)
			: [];

	$: if ($eventListsMap[pubkey] && $eventListsMap[pubkey][kind]) {
		viewEvent = $eventListsMap[pubkey][kind].get($keysArray[$listNum]);
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
		loadNotes = false;
		$nowProgress = true;
		console.log('onMount executed');

		await bkminit(pubkey);
		checkLoading();
		$nowProgress = false;
	};
	let loadNotes = false;
	function checkLoading() {
		// 定期的に $eventListsMap[pubkey][kind] の長さをチェック
		let previousLength = $eventListsMap?.[pubkey]?.[kind]?.size || 0;
		const interval = setInterval(() => {
			const currentLength = $eventListsMap[pubkey][kind]?.size || 0;
			if (currentLength === previousLength) {
				loadNotes = true;
				clearInterval(interval);
			} else {
				previousLength = currentLength;
			}
		}, 1000);
	}
	export async function bkminit(pub: string) {
		$listNum = 0;

		bkm = 'pub';
		$isMulti = MultiMenu.None;
		console.log('bkminit');

		//console.log(await getRelays(pubkey)); //await setRelays(testRelay);
		if ($pubkey_viewer === undefined || $pubkey_viewer === '') {
			//$pubkey_viewer = await getPub($nip46Check); //NIP46拒否られてるときはNIP46画面出さない
			try {
				const NostrLogin = await import('nostr-login');
				NostrLogin.init({
					/*options*/
					//noBanner: true
				})
					.then(async () => {
						const gotPubkey = await (
							window?.nostr as Nostr.Nip07.Nostr
						).getPublicKey();
						if (gotPubkey) {
							$pubkey_viewer = gotPubkey;
						}
					})
					.catch((error) => {
						console.log(error);
					});
			} catch (error) {
				console.log(error);
			}
		}

		console.log($pubkey_viewer);
		//	console.log(pub);
		//if ($bookmarkRelays.length === 0) {

		//パブキーに対するリレーセットが設定されてなかったら取得する（戻るボタンとかで同じユーザーになった場合に省略されるはず）

		if (!$relaySet || !$relaySet[pub]) {
			const t: ToastSettings = {
				message: `${$_('toast.relaySearching')}`
			};
			const getRelaysToast = toastStore.trigger(t);
			$relaySet[pub] = initRelaySet;
			await getRelays(pub);
			toastStore.close(getRelaysToast);
		}
		if (
			$pubkey_viewer &&
			pub !== $pubkey_viewer &&
			!$relaySet[$pubkey_viewer]
		) {
			$relaySet[$pubkey_viewer] = initRelaySet;

			await getRelays($pubkey_viewer);
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
		//console.log(filter);
		//console.log(pubkey, $relaySet[pubkey].bookmarkRelays);
		const t: ToastSettings = {
			message: `${$_('toast.eventSearching')}`
		};
		const searchingEventsToast = toastStore.trigger(t);
		StoreFetchFilteredEvents(pubkey, kind, {
			relays: $relaySet[pubkey].mergeRelays,
			filters: filter
		});

		bkm = 'pub';
		listedEventRef?.viewUpdate(); //
		toastStore.close(searchingEventsToast);
	}

	//リストが変わったら1ページ目に戻す
	$: if ($listNum !== -1 && typeof window !== 'undefined') {
		$isMulti = MultiMenu.None;
		$pageNum = 0;
		$checkedIndexList = [];
		bkm = 'pub';
		window.scrollTo({ top: 0 });
	}
	//ページが変わったらチェックリスト空にする
	$: if (($pageNum !== -1 || bkm) && typeof window !== 'undefined') {
		$isMulti = MultiMenu.None;
		$checkedIndexList = [];
		window.scrollTo({ top: 0 });
	}

	//---------------------------------------------delete?modal
	const deleteModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalDelete,
		// Add the component properties as key/value pairs
		//props: { background: 'bg-red-500' },
		// Provide a template literal for the default component slot
		slot: '<p>Skeleton</p>'
	};

	async function DeleteNote(e: {
		detail: { number: number; event: any; tagArray: any };
	}) {
		if ($nowProgress) {
			return;
		}
		console.log('DeleteNote');
		console.log(e.detail);
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
				tags: [e.detail.tagArray]
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
		if ($eventListsMap) {
			//$nowProgress = true;
			console.log($eventListsMap[pubkey][kind].get($keysArray[listNumber]));
			//	await updateBkmTag(pubkey, kind, listNumber); //最新の状態に更新
			try {
				const bkmk = $eventListsMap[pubkey][kind].get($keysArray[listNumber]);
				if (bkmk) {
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
					console.log(event);
					const result = await publishEventWithTimeout(
						event,
						$relaySet[$pubkey_viewer].writeRelays
					);
					//   console.log(result);
					if (result.isSuccess && $eventListsMap && result.event) {
						listedEventRef?.viewUpdate(); //ListedEventのviewUpdate()を行う（prvだったときに表示の更新とか）

						//streamの方で購読してるから要らん
						// $eventListsMap[pubkey][kind].set(
						// 	$keysArray[listNumber],
						// 	result.event
						// );
						viewEvent = $eventListsMap[pubkey][kind].get(
							$keysArray[listNumber]
						);
						const t = {
							message: 'Delete note<br>' + result.msg,
							timeout: 3000
						};

						toastStore.trigger(t);
					} else {
						console.log(result.msg);
						const t = {
							message: $_('toast.failed_publish'),
							timeout: 3000,
							background: 'bg-orange-500 text-white width-filled '
						};

						toastStore.trigger(t);
					}
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
		$isMulti = MultiMenu.None;
	}

	//---------------------------------------------move
	const moveModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalMove
	};
	function MoveNote(e: {
		detail: { number: number; event: any; tagArray: any };
	}): void {
		if ($nowProgress) {
			return;
		}
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
				$identifierListsMap[pubkey]?.[kind]?.get(
					$identifierKeysArray[listNumber]
				)?.identifier
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

	//---------------------------------------------move prv⇔pub

	async function MoveBkmNote(e: {
		detail: { number: number; event: any; tagArray: any };
	}): Promise<void> {
		if ($nowProgress) {
			return;
		}
		$nowProgress = true;
		console.log('MoveNote');
		const number: number = e.detail.number + $pageNum * $amount;
		console.log(number);
		console.log(e.detail.event);
		console.log(e.detail.tagArray);
		const listNumber = $listNum;
		const _bkm = bkm;
		await moveNoteSuruyatu(
			[number],
			[e.detail.tagArray],
			{ tag: listNumber, bkm: _bkm },
			{ tag: listNumber, bkm: _bkm === 'prv' ? 'pub' : 'prv' }
		);
		$nowProgress = false;
	}

	function CheckNote(e: {
		detail: { number: number; event: any; tagArray: any };
	}): void {
		console.log(e);
		console.log('CheckNote');
		//const number: number = e.detail.number + $pageNum * $amount;
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
				$identifierListsMap[pubkey]?.[kind] &&
				$identifierListsMap[pubkey][kind].has($identifierKeysArray[$listNum]) &&
				$identifierListsMap[pubkey][kind].get($identifierKeysArray[$listNum])
					?.identifier
					? $identifierListsMap[pubkey][kind].get(
							$identifierKeysArray[$listNum]
						)?.identifier
					: `kind:${kind}`,

			body: '',
			value: {
				type: 'add',
				kind: kind,
				pubkey: pubkey,
				viewList: viewList
				//event: $eventListsMap[pubkey][kind].get($keysArray[$listNum])
				//	viewList: viewList
			},
			response: async (res: { btn: string; tag: string[]; check: boolean }) => {
				console.log(res); //有効だったらタグになって帰ってきてほしい
				//check=trueは重複チェックして
				$nowProgress = true;
				await addNotesuruyatu(res);
				$nowProgress = false;
			}
		};
		modalStore.trigger(modal);
	}

	async function addNotesuruyatu(res: {
		btn: string;
		tag: string[];
		check: boolean;
	}) {
		console.log(res);
		if (res) {
			const listNumber = $listNum;
			try {
				await addNotesToLists(
					listNumber,
					res.btn,
					[res.tag],
					pubkey,
					kind,
					res.check
				);
			} catch (error) {
				const errorMessage = (error as Error).message;

				const t = {
					message: errorMessage ?? $_('toast.failed_publish'),
					timeout: 3000,
					background: 'bg-orange-500 text-white width-filled '
				};

				toastStore.trigger(t);
			}
			$nowProgress = false;
		}
		//}
	}

	async function addNotesToLists(
		listNumber: number,
		btn: string,
		idTagList: string[][],
		pubkey: string,
		kind: number,
		check: boolean //重複チェック有無
	): Promise<boolean> {
		let isSuccess = false;

		try {
			const bkmk = $eventListsMap?.[pubkey]?.[kind]?.get(
				$keysArray[listNumber]
			);

			//重複したタグ（二番目の要素まで）があるかちぇっく
			//if (bkmk) {//すでにあるとこに追加
			const tagsToAdd = () => {
				if (btn === 'pub' && bkmk) {
					if (check && bkmk) {
						console.log(idTagList);
						idTagList.map((tag) => {
							const index = bkmk.tags.findIndex(
								(item: string[]) =>
									item
										.slice(0, 2)
										.every((element, index) => element === tag[index])

								//item.slice(0, 2) === tag.slice(0, 2)
							);

							if (index !== -1) {
								throw Error(`${$_('toast.invalidEmoji')}`);
							}
						});
					}
					const reTag =
						bkmk !== undefined ? [...bkmk.tags, ...idTagList] : idTagList;
					return reTag;
				} else if (bkmk) {
					return bkmk.tags;
				} else {
					return idTagList;
				}
			};

			// const tagsToAdd =
			// 	btn === 'pub'
			// 		? bkmk !== undefined
			// 			? [...bkmk.tags, ...idTagList]
			// 			: idTagList
			// 		: bkmk.tags;

			const contentToAdd = async (): Promise<string> => {
				if (btn === 'pub') {
					if (bkmk && bkmk.content) {
						return bkmk.content;
					} else {
						return '';
					}
				} else {
					if (bkmk && bkmk.content) {
						try {
							return await addPrivates(bkmk.content, pubkey, idTagList, check);
						} catch (error: any) {
							throw Error(error);
						}
					} else {
						return await addPrivates('', pubkey, idTagList, check);
					}
				}
			};

			const event: Nostr.Event = {
				id: '',
				pubkey: pubkey,
				created_at: Math.floor(Date.now() / 1000),
				kind: kind,
				tags: tagsToAdd(),
				content: await contentToAdd(),
				sig: ''
			};

			console.log(event);

			const result = await publishEventWithTimeout(
				event,
				$relaySet[$pubkey_viewer]?.writeRelays
			);

			if (result.isSuccess) {
				listedEventRef?.viewUpdate(); //ListedEventのviewUpdate()を行う（prvだったときに表示の更新とか）

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
			} else {
				const t = {
					message: $_('toast.failed_publish'),
					timeout: 3000,
					background: 'bg-orange-500 text-white width-filled '
				};

				toastStore.trigger(t);
			}
			//	}
		} catch (error: any) {
			throw Error(error);
			// console.error(error);

			// const t = {
			// 	message: $_('toast.failed_publish'),
			// 	timeout: 3000,
			// 	background: 'bg-orange-500 text-white width-filled '
			// };

			// toastStore.trigger(t);
		}

		return isSuccess;
	}

	let viewList: string[][];
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
			body: `${$_('modal.moveNote.body_from')} ${
				$identifierListsMap[listNumber]
			}[${_bkm === 'pub' ? $_('public') : $_('private')}] ${$_(
				'modal.moveNote.body_to'
			)}`,
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
				event: $checkedIndexList.map((item) => item.event),
				tags: $checkedIndexList.map((item) => item.tagArray)
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
		if ($eventListsMap[pubkey][kind].size > 0) {
			//toの方にaddNoteする。

			//await updateBkmTag(pubkey, kind, from.tag); //最新の状態に更新
			//moveのときは重複チェック無しで...
			const addRes = await addNotesToLists(
				to.tag,
				to.bkm,
				tags,
				pubkey,
				kind,
				false
			);
			if (!addRes) {
				//		$nowProgress = false;
				return;
			}
			const deleteRes = await deleteNotesfromLists(from.tag, indexes);
			//		$nowProgress = false;
			listedEventRef?.viewUpdate();
		}
	}

	function EditTag(e: CustomEvent<any>): void {
		console.log(e.detail);
		const listNumber = $listNum; //ここにきたじてんのNumberでこてい

		const number: number = e.detail.number + $pageNum * $amount;
		const tagArray: string[] = e.detail.tagArray;
		const modal: ModalSettings = {
			type: 'component',
			// // Pass the component directly:
			component: addModalComponent,
			// Provide arbitrary metadata to your modal instance:
			title:
				$identifierListsMap[pubkey]?.[kind] &&
				$identifierListsMap[pubkey][kind].has(
					$identifierKeysArray[listNumber]
				) &&
				$identifierListsMap[pubkey][kind].get($identifierKeysArray[listNumber])
					?.identifier
					? $identifierListsMap[pubkey][kind].get(
							$identifierKeysArray[listNumber]
						)?.identifier
					: `kind:${kind}`,

			body: '',
			value: {
				type: 'edit',
				kind: kind,
				pubkey: pubkey,
				event: $eventListsMap[pubkey]?.[kind]?.get($keysArray[listNumber]),
				tag: tagArray,
				number: number,
				bkm: bkm, //編集は今開いてる方だから
				viewList: viewList
			},
			response: async (res: { btn: string; tag: string[] }) => {
				if (res && JSON.stringify(res.tag) !== JSON.stringify(tagArray)) {
					console.log(JSON.stringify(res.tag) !== JSON.stringify(tagArray)); //有効だったらタグになって帰ってきてほしい
					res.btn = bkm; //編集だから元のボタンといっしょだから
					$nowProgress = true;
					await EditTagEvent(listNumber, res, number);
					$nowProgress = false;
				}
			}
		};
		modalStore.trigger(modal);
	}

	async function EditTagEvent(
		listNumber: number,
		res: { btn: string; tag: string[] },
		number: number
	) {
		const eventList = $eventListsMap[pubkey][kind].get($keysArray[listNumber]);
		if (eventList) {
			const tag: string[][] = eventList.tags;
			if (res.btn === 'pub') {
				tag[number] = res.tag;
			}
			const contentToAdd = async (): Promise<string> => {
				if (res.btn === 'pub') {
					return eventList.content;
				} else {
					return await editPrivates(eventList.content, pubkey, number, res.tag);
				}
			};

			const event: Nostr.Event = {
				id: '',
				pubkey: pubkey,
				created_at: Math.floor(Date.now() / 1000),
				kind: eventList.kind,
				tags: tag,
				content: await contentToAdd(),
				sig: ''
			};
			console.log(event);

			const result = await publishEventWithTimeout(
				event,
				$relaySet[$pubkey_viewer]?.writeRelays
			);

			if (result.isSuccess) {
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

	function onClickCancelSort() {
		listedEventRef?.resetItems();
	}
	function SortReset() {
		listedEventRef?.resetItems();
	}
	async function onClickDoneSort() {
		$nowProgress = true;
		const listNumber = $listNum;
		const eventList = $eventListsMap[pubkey][kind].get($keysArray[listNumber]);
		try {
			if (!eventList) {
				throw Error;
			}

			const tags = listedEventRef?.getSortedTags();
			console.log(tags);
			const content = async (): Promise<string> => {
				if (bkm === 'pub') {
					return eventList.content;
				} else {
					try {
						return await nip04En(pubkey, JSON.stringify(tags));
					} catch (error) {
						throw Error;
					}
				}
			};

			const event: Nostr.Event = {
				id: '',
				pubkey: pubkey,
				created_at: Math.floor(Date.now() / 1000),
				kind: kind,
				tags: bkm === 'pub' ? tags : eventList.tags,
				content: await content(),
				sig: ''
			};
			const result = await publishEventWithTimeout(
				event,
				$relaySet[$pubkey_viewer].writeRelays
			);
			//   console.log(result);
			if (result.isSuccess && $eventListsMap && result.event) {
				listedEventRef?.viewUpdate(); //ListedEventのviewUpdate()を行う（prvだったときに表示の更新とか）

				//streamの方で購読してるから要らん
				// $eventListsMap[pubkey][kind].set(
				// 	$keysArray[listNumber],
				// 	result.event
				// );
				viewEvent = $eventListsMap[pubkey][kind].get($keysArray[listNumber]);
				const t = {
					message: 'Published Event<br>' + result.msg,
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
		$checkedIndexList = [];
		$isMulti = MultiMenu.None;
		$nowProgress = false;
	}

	async function awaitInterval(time: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, time);
		});
	}
</script>

<!-- {#await bkminit(pubkey) then bkminti} -->
{#if $relaySet && $relaySet[pubkey] && $relaySet[pubkey].mergeRelays && $relaySet[pubkey].mergeRelays.length > 0}
	<NostrApp>
		<!--header-->
		<Header {kind} bind:bkm {pubkey} bind:viewEvent />

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
						{#if $identifierListsMap && $identifierListsMap[pubkey] && $identifierListsMap[pubkey][kind]?.size > 0}
							<ListBox
								class=" overflow-y-auto w-full"
								active="variant-ghost-primary box-border"
							>
								{#each $identifierKeysArray as list, index}
									<ListBoxItem
										bind:group={$listNum}
										name={$identifierListsMap[pubkey][kind].get(list)
											?.identifier ?? ''}
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
										{#if $identifierListsMap[pubkey][kind].get(list)?.title}
											<div class="text-xs">
												{$identifierListsMap[pubkey][kind].get(list)
													?.identifier}
											</div>
											<div>
												{$identifierListsMap[pubkey][kind].get(list)?.title}
											</div>
										{:else}
											{$identifierListsMap[pubkey][kind].get(list)?.identifier}
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
						: 'md:ml-[12em]'} overflow-y-auto overflow-x-hidden pb-[2em] min-h-[75vh]"
				>
					<!-- Add ml-64 to push main to the right -->

					<ListedEvent
						bind:this={listedEventRef}
						listEvent={viewEvent}
						{pubkey}
						{DeleteNote}
						{MoveNote}
						{MoveBkmNote}
						{CheckNote}
						bind:bkm
						bind:isOwner
						on:EditTag={EditTag}
						bind:viewList
						{isNaddr}
						{loadNotes}
					/>
				</main>
			</div>
		</div>
	</NostrApp>
	<!-- {:else}
{`now getting relay list ...`} -->
{/if}
<!--
{#if $eventListsMap && $eventListsMap[pubkey] && $eventListsMap[pubkey][kind] && $eventListsMap[pubkey][kind].size > 0}

{:else}
	<div class="flex w-full h-full justify-center items-center text-center">
	

		{#if $nowProgress}
			{`now loading...`}
		{:else}
			{`no data`}
		{/if}
	</div>
{/if} -->
<!-------------------------------あど---no dataでも、parameterizedじゃない方は、ついかできる-->
{#if !$nowProgress && !viewEvent && parameterizedReplaceable(kind) && $pubkey_viewer === pubkey}
	{#await awaitInterval(2000) then}
		<div
			class="top-1/2 -translate-y-1/2 fixed left-1/2 -translate-x-1/2 box-border overflow-x-hidden"
		>
			<div class="flex flex-wrap gap-3 fill-primary-800 dark:fill-primary-100">
				{$_('nodata.iconbefore')}
				{@html FormatListBulleted}
				{$_('nodata.iconafter')}
			</div>
		</div>{/await}
{:else if !$nowProgress && $pubkey_viewer === pubkey && kindsValidTag.hasOwnProperty(kind)}
	<div
		class="fixed bottom-14 z-10 box-border overflow-x-hidden {$isMulti
			? 'multi'
			: 'add'}"
	>
		<div class="fill-white overflow-x-hidden h-fit overflow-y-auto">
			{#if $isMulti === MultiMenu.None}
				<button
					class="addIcon btn-icon variant-filled-secondary fill-white hover:variant-ghost-secondary hover:stroke-secondary-500 overflow-x-hidden"
					on:click={onClickAdd}>{@html addIcon}</button
				>
			{:else if $isMulti === MultiMenu.Multi}
				<!-- {#if !(!$page.params.hasOwnProperty('npub') || !isOwner || !viewEvent?.kind || viewEvent?.kind < 30000 || viewEvent?.kind >= 40000 || isNaddr)} -->
				<button
					disabled={!$page.params.hasOwnProperty('npub') ||
						!isOwner ||
						!viewEvent?.kind ||
						viewEvent?.kind < 30000 ||
						viewEvent?.kind >= 40000 ||
						isNaddr}
					class="addIcon btn-icon variant-filled-secondary fill-white hover:variant-ghost-secondary hover:stroke-secondary-500 overflow-x-hidden"
					on:click={onClickMultiMove}>{@html MoveIcon}</button
				>
				<!-- {/if} -->
				<button
					class="overflow-x-hidden addIcon btn-icon variant-filled-warning fill-white mx-1 hover:variant-ghost-warning hover:stroke-warning-500"
					on:click={onClickMultiDelete}>{@html DeleteIcon}</button
				>
			{:else if $isMulti === MultiMenu.Sort}
				<button
					class="addIcon btn-icon variant-filled-secondary fill-white hover:variant-ghost-secondary hover:stroke-secondary-500 overflow-x-hidden"
					on:click={onClickCancelSort}>{@html CancelIcon}</button
				>
				<button
					class="overflow-x-hidden addIcon btn-icon variant-filled-warning fill-white mx-1 hover:variant-ghost-warning hover:stroke-warning-500"
					on:click={onClickDoneSort}>{@html DoneIcon}</button
				>
			{/if}
		</div>
	</div>
{/if}
<FooterMenu
	bind:pubkey
	{kind}
	naddr={isNaddr}
	bind:bkm
	on:SortReset={SortReset}
/>

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
