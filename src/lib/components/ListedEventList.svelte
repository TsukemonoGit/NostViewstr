<script lang="ts">
	import { _ } from 'svelte-i18n';
	import addIcon from '@material-design-icons/svg/round/bookmark_add.svg?raw';

	import ListedEvent from '$lib/components/ListedEvent.svelte';
	//import { listEvent } from '$lib/testData/list';
	import {
		bookmarkEvents,
		checkedIndexList,
		identifierList,
		listNum
	} from '$lib/stores/bookmarkEvents';
	import {
		addPrivates,
		checkInput,
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

	import backIcon from '@material-design-icons/svg/round/chevron_left.svg?raw';
	import nextIcon from '@material-design-icons/svg/round/chevron_right.svg?raw';
	import DeleteIcon from '@material-design-icons/svg/round/delete.svg?raw';
	import MoveIcon from '@material-design-icons/svg/round/arrow_circle_right.svg?raw';
	import updateIcon from '@material-design-icons/svg/round/update.svg?raw';
	import infoIcon from '@material-design-icons/svg/round/info.svg?raw';
	//	import LockIcon from '@material-design-icons/svg/round/shield_lock.svg?raw';
	//	import KidStar from '@material-design-icons/svg/round/kid_star.svg?raw';
	import PubBkm from './Button/PubBkm.svelte';
	import PrvBkm from './Button/PrvBkm.svelte';
	import { searchRelays, postRelays, bookmarkRelays } from '$lib/stores/relays';
	import {
		iconView,
		isMulti,
		nowProgress,
		pubkey_viewer
	} from '$lib/stores/settings';
	//import type { Event } from 'nostr-tools';
	import { amount, listSize, pageNum } from '$lib/stores/pagination';
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import ModalAddNote from '$lib/components/modals/ModalAddNote.svelte';
	import ModalDelete from '$lib/components/modals/ModalDelete.svelte';
	import ModalMove from '$lib/components/modals/ModalMove.svelte';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { NostrApp, type Nostr } from 'nosvelte';
	import ModalListInfo from './modals/ModalListInfo.svelte';
	import ModalEventJson from './modals/ModalEventJson.svelte';
	import ModalPostNote from './modals/ModalPostNote.svelte';
	import { nip19 } from 'nostr-tools';

	let size: number;
	let bkm: string = 'pub';
	let viewEvent: Nostr.Event<number>;
	export let pubkey: string;
	export let kind: number;
	export let identifier: string | undefined = undefined;
	let isOwner: boolean;
	//let num: number = 0;
	$: createdAt = viewEvent?.created_at;
	$: isOwner = $pubkey_viewer === pubkey;
	onMount(async () => {
		if ($pubkey_viewer === '') {
			try {
				const res = await getPub();
				if (res !== '') {
					$pubkey_viewer = res;
				}
			} catch (error) {
				console.log('failed to login');
			}
		}
		$nowProgress = true;
		await bkminit(pubkey);
		$nowProgress = false;
	});
	async function bkminit(pub: string) {
		//console.log(await getRelays(pubkey)); //await setRelays(testRelay);
		if ($pubkey_viewer === undefined || $pubkey_viewer === '') {
			$pubkey_viewer = await getPub();
		}

		console.log($pubkey_viewer);
		console.log(pub);
		if ($bookmarkRelays.length === 0) {
			console.log(await getRelays(pub));
		}
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
		$nowProgress = true;
		const res = await fetchFilteredEvents($bookmarkRelays, filter);
		console.log(res);
		//const res = bookmarks;
		if (res.length === 0) {
			return;
		}
		res.sort((a, b) => {
			const tagID_A = a.tags[0][1];
			const tagID_B = b.tags[0][1];
			return tagID_A.localeCompare(tagID_B);
		});
		$bookmarkEvents = res;
		//viewEvent = $bookmarkEvents[0];
		$nowProgress = false;
		console.log(res);
	}

	$: if ($bookmarkEvents) {
		viewEvent = $bookmarkEvents[$listNum];
	}
	//リストが変わったら1ページ目に戻す
	$: if ($listNum !== -1) {
		$isMulti = false;
		$pageNum = 0;
		$checkedIndexList = [];
		bkm = 'pub';
		window.scrollTo({ top: 0 });
	}
	//ページが変わったらチェックリスト空にする
	$: if ($pageNum !== -1 || bkm) {
		$checkedIndexList = [];
		window.scrollTo({ top: 0 });
	}
	$: listNaddr = viewEvent
		? [
				'a',
				`${viewEvent.kind}:${viewEvent.pubkey}:${
					$identifierList[$listNum].identifier ?? ''
				}`
		  ]
		: [];
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
			title: $_('nprofile.modal.deleteNote.title'),
			body: `${$_('nprofile.modal.deleteNote.body')}`,
			value: {
				event: [e.detail.event]
			},
			response: async (res) => {
				//console.log(res);
				if (res) {
					await deleteNotesfromLists(listNumber, [number]);
					//    deleteNoteIndexes = [];
				} else {
					//  deleteNoteIndexes = [];
				}
			}
		};
		modalStore.trigger(modal);
	}

	async function deleteNotesfromLists(listNumber: number, numList: number[]) {
		if ($bookmarkEvents) {
			$nowProgress = true;

			await updateBkmTag(listNumber); //最新の状態に更新
			try {
				const bkmk = $bookmarkEvents[listNumber];

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
				const result = await publishEventWithTimeout(event, $bookmarkRelays);
				//   console.log(result);
				if (result.isSuccess && $bookmarkEvents && result.event) {
					$bookmarkEvents[listNumber] = result.event;
					viewEvent = $bookmarkEvents[listNumber];
					const t = {
						message: 'Delete note<br>' + result.msg,
						timeout: 3000
					};

					toastStore.trigger(t);
				} else {
					const t = {
						message: $_('nprofile.toast.failed_publish'),
						timeout: 3000,
						background: 'bg-orange-500 text-white width-filled '
					};

					toastStore.trigger(t);
				}
			} catch (error) {
				const t = {
					message: $_('nprofile.toast.failed_publish'),
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
			title: $_('nprofile.modal.moveNote.title'),
			body: `${$_('nprofile.modal.moveNote.body_from')} ${
				$identifierList[listNumber].identifier
			}[${_bkm === 'pub' ? $_('public') : $_('private')}] ${$_(
				'nprofile.modal.moveNote.body_to'
			)}`,
			value: {
				bkm: _bkm,
				tag: listNumber
			},
			response: (res) => {
				//console.log(res);
				if (res) {
					//$nowProgress = true;
					moveNoteSuruyatu(
						[number],
						[e.detail.tagArray],
						{ tag: listNumber, bkm: _bkm },
						{ tag: res.tag, bkm: res.bkm }
					);
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
			title: $identifierList[$listNum].identifier,
			body: $_('nprofile.modal.addNote_body'),
			response: async (res) => {
				console.log(res);
				await addNotesuruyatu(res);
			}
		};
		modalStore.trigger(modal);
	}

	async function addNotesuruyatu(res: any) {
		console.log(res);
		if (res) {
			const listNumber = $listNum;
			let check: { tag?: string[]; error: boolean; message?: string } = {
				error: false
			};

			$nowProgress = true;
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
							$nowProgress = false;
							return;
						}
					}
				}
			}
			if (res.type === 'id') {
				check = await checkInput(noteID);
				if (check.error && check.message) {
					const t = {
						message: check.message,
						timeout: 3000,
						background: 'bg-orange-500 text-white width-filled '
					};

					toastStore.trigger(t);
					$nowProgress = false;
					return;
				}
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
						message: $_('nprofile.toast.failed_publish'),
						timeout: 3000,
						background: 'bg-orange-500 text-white width-filled '
					};

					toastStore.trigger(t);
					$nowProgress = false;
					return;
				}
			}

			//idのチェックが終わったのでcheck.tagを入れる
			if (check && check.error && check.message) {
				const t = {
					message: check.message,
					timeout: 3000,
					background: 'bg-orange-500 text-white width-filled '
				};

				toastStore.trigger(t);
				return;
			} else if (check.tag && check.tag.length > 0 && $bookmarkEvents) {
				await updateBkmTag(listNumber); //最新の状態に更新
				await addNotesToLists(listNumber, res.btn, [check.tag]);
			}
			$nowProgress = false;
		}
	}
	async function addNotesToLists(
		listNumber: number,
		btn: string,
		idTagList: string[][]
	): Promise<boolean> {
		let isSuccess = false;
		if ($bookmarkEvents !== undefined) {
			try {
				const bkmk = $bookmarkEvents[listNumber];
				//bkm.tags.push(check.tag);
				const event: Nostr.Event = {
					id: '',
					pubkey: bkmk.pubkey,
					created_at: Math.floor(Date.now() / 1000),
					kind: bkmk.kind,
					tags:
						btn === 'pub' && idTagList
							? [...bkmk.tags, ...idTagList]
							: bkmk.tags,
					content:
						btn === 'pub'
							? bkmk.content
							: await addPrivates(bkmk.content, bkmk.pubkey, idTagList), //ここでエラーの可能性ある
					sig: ''
				};
				const result = await publishEventWithTimeout(event, $bookmarkRelays);
				//   console.log(result);
				if (result.isSuccess && $bookmarkEvents && result.event) {
					$bookmarkEvents[listNumber] = result.event;
					viewEvent = $bookmarkEvents[listNumber]; //今は失敗判定になってるから更新確認できないよ

					const t = {
						message: 'Add note<br>' + result.msg,
						timeout: 3000
					};

					toastStore.trigger(t);
					isSuccess = true;
				} else {
					const t = {
						message: $_('nprofile.toast.failed_publish'),
						timeout: 3000,
						background: 'bg-orange-500 text-white width-filled '
					};

					toastStore.trigger(t);
				}
			} catch (error) {
				const t = {
					message: $_('nprofile.toast.failed_publish'),
					timeout: 3000,
					background: 'bg-orange-500 text-white width-filled '
				};

				toastStore.trigger(t);
			}
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
	const borderClassActive = `break-keep border-b-2 border-white place-items-end  flex m-1 p-0.5 pb-0 h6 `;
	const borderClass = `break-keep  place-items-end p-0.5 flex m-1 h6`;

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
			title: $_('nprofile.modal.moveNote.title'),
			body: `${$_('nprofile.modal.moveNote.body_from')} ${
				$identifierList[listNumber]
			}[${_bkm === 'pub' ? $_('public') : $_('private')}] ${$_(
				'nprofile.modal.moveNote.body_to'
			)}`,
			value: {
				bkm: _bkm,
				tag: listNumber
			},
			response: (res) => {
				//console.log(res);
				if (res) {
					//$nowProgress = true;
					console.log(res.bkm);
					moveNoteSuruyatu(
						indexes,
						tagArrays,
						{ tag: listNumber, bkm: _bkm },
						{ tag: res.tag, bkm: res.bkm }
					);
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
			title: $_('nprofile.modal.deleteNote.title'),
			body: `${$_('nprofile.modal.deleteNote.body')}`,
			value: {
				event: $checkedIndexList.map((item) => item.event)
			},
			response: async (res) => {
				//console.log(res);
				if (res) {
					await deleteNotesfromLists(listN, indexes);
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
		if ($bookmarkEvents.length > 0) {
			//toの方にaddNoteする。
			await updateBkmTag(from.tag); //最新の状態に更新

			const addRes = await addNotesToLists(to.tag, to.bkm, tags);
			if (!addRes) {
				$nowProgress = false;
				return;
			}
			const deleteRes = await deleteNotesfromLists(from.tag, indexes);
			$nowProgress = false;
		}
	}

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
			title: $_('nprofile.modal.listInfo.title'),

			value: { pubkey: pubkey },
			// Returns the updated response value
			response: async (res) => {
				console.log(res);
				if (res) {
					if (res.update) {
						await updateListInfo(res);
					} else if (res.share) {
						//postNoteModalをだす
						openModaltoShare();
					}
				}
			}
		};
		modalStore.trigger(modal);
	}

	function openModaltoShare() {
		const listNumber = $listNum;
		//const test = window.location;		console.log(test);
		const address: nip19.AddressPointer = {
			identifier: $identifierList[listNumber].identifier ?? '',
			pubkey: pubkey,
			kind: kind,
			relays: $bookmarkRelays
		};

		const url = window.location.origin + '/' + nip19.naddrEncode(address);
		const tags = [
			['a', `${kind}:${pubkey}:${$identifierList[listNumber].identifier}`],
			['r', url]
		];
		console.log(tags);
		const modal: ModalSettings = {
			type: 'component',
			component: postNoteModalComponent,
			title: $_('nprofile.modal.postNote.title'),
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

	async function updateListInfo(res: {
		title: string;
		image: string;
		summary: string;
	}) {
		console.log(res);
		const listNumber = $listNum;
		const eventTag = $bookmarkEvents[listNumber].tags;

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

		const summaryIndex = eventTag.findIndex((item) => item[0] === 'summary');
		if (summaryIndex !== -1) {
			// すでに "title" タグが存在する場合、値を更新
			eventTag[summaryIndex][1] = res.summary;
		} else {
			// "title" タグが存在しない場合、配列の二番目（dタグの後ろ）に挿入
			eventTag.splice(imageIndex + 1, 0, ['summary', res.summary]);
		}
		console.log(eventTag);
		const event: Nostr.Event = {
			id: '',
			kind: $bookmarkEvents[listNumber].kind,
			pubkey: pubkey,
			content: $bookmarkEvents[listNumber].content,
			tags: eventTag,
			created_at: Math.floor(Date.now() / 1000),
			sig: ''
		};
		const result = await publishEventWithTimeout(event, $bookmarkRelays);
		console.log(result);
		if (result.isSuccess && $bookmarkEvents && result.event) {
			$bookmarkEvents[listNumber] = result.event;
			viewEvent = $bookmarkEvents[listNumber];
			const t = {
				message: 'Add note<br>' + result.msg,
				timeout: 3000
			};

			toastStore.trigger(t);
		} else {
			const t = {
				message: $_('nprofile.toast.failed_publish'),
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
		}
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
</script>

<!-- {#await bkminit(pubkey) then bkminti} -->
{#if $bookmarkEvents && $bookmarkEvents.length > 0}
	<!--header-->
	<div
		class="z-10 fixed h-[3em] top-0 space-x-0 w-full inline-flex flex-row overflow-x-hidden"
	>
		<div
			class="h-[3em] flex space-x-0 bg-surface-500 text-white container max-w-[1024px] mx-auto justify-center items-center"
		>
			{#if $bookmarkEvents.length > 1}
				<div class="flex">
					<button
						class="arrow btn p-0 rounded"
						on:click={() => onClickPage(-1)}
						disabled={$listNum <= 0}>{@html backIcon}</button
					>
					<button
						class="arrow btn p-0 rounded"
						on:click={() => onClickPage(1)}
						disabled={$listNum >= $bookmarkEvents.length - 1}
						>{@html nextIcon}</button
					>
				</div>
			{/if}

			<!--variant-ghost-primary border-b border-surface-400-500-token pb-0 break-keep overflow-hidden"-->

			{#if !$identifierList[$listNum].title || $identifierList[$listNum].title === ''}
				<button
					class="h4 flex h-full items-center pt-1"
					on:click={listInfoModalOpen}
				>
					<div class=" btn-icon btn-icon-sm fill-white place-self-center">
						{@html infoIcon}
					</div>
					{$identifierList[$listNum].identifier}
				</button>
			{:else}
				<button
					class="grid grid-cols-[auto_1fr] h-full items-center pr-0.5"
					on:click={listInfoModalOpen}
				>
					{#if $iconView && $identifierList[$listNum].image}
						<div class="btn-icon btn-icon-sm mr-1">
							<img
								width={36}
								class="min-w-[36px]"
								alt=""
								src={$identifierList[$listNum].image}
							/>
						</div>
					{:else}
						<div class="btn-icon btn-icon-sm fill-white place-self-center">
							{@html infoIcon}
						</div>
					{/if}
					<div class="grid grid-rows-[auto_1fr]">
						<div class="place-self-start text-xs p-0">
							{$identifierList[$listNum].identifier}
						</div>

						<div class="h5 overflow-hidden break-keep">
							{$identifierList[$listNum].title}
						</div>
					</div>
				</button>

				<!-- {#if $identifierList[$listNum].summary}
					{$identifierList[$listNum].summary}
				{/if} -->
			{/if}

			<div class="flex-grow overflow-hidden">
				<div class="grid grid-cols-[1fr_auto_auto] gap-2 overflow-hidden">
					<div />
					<div class="grid grid-cols-[auto_auto]">
						<button
							class={bkm === 'pub' ? borderClassActive : borderClass}
							disabled={bkm === 'pub'}
							on:click={() => {
								bkm = 'pub';
								console.log(bkm);
								$pageNum = 0;
							}}
							><PubBkm />
						</button>
						{#if isOwner && viewEvent?.content !== ''}
							<button
								class={bkm === 'prv' ? borderClassActive : borderClass}
								disabled={bkm === 'prv'}
								on:click={() => {
									bkm = 'prv';
									console.log(bkm);
									$pageNum = 0;
								}}
							>
								<PrvBkm />
							</button>
						{:else}
							<div />
						{/if}
					</div>
					<div class="grid grid-cols-[auto_auto]">
						<div class=" grid grid-rows-[auto_atuo] overflow-hidden">
							<div class=" place-self-end h6">
								{$_('created_at')}
							</div>
							<button
								class="flex text-right place-self-end text-sm underline decoration-secondary-200"
								on:click={() => {
									OpenNoteJson(viewEvent, listNaddr);
								}}
							>
								<div class="whitespace-nowrap overflow-hidden h6">
									{new Date(createdAt * 1000).toLocaleDateString([], {
										year: 'numeric',
										month: '2-digit',
										day: '2-digit',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</div></button
							>
						</div>
						<button
							class={'btn p-0 pr-1  arrow'}
							on:click={async () => {
								$nowProgress = true;
								await updateBkmTag($listNum);
								$nowProgress = false;
							}}>{@html updateIcon}</button
						>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!---->
	<main
		class="my-12 overflow-w-hidden container max-w-[1024px] h-full mx-auto justify-center items-center"
	>
		<!-- <LightSwitch />
	<button
		on:click={() => {
			if ($bookmarkEvents && $listNum > 0) {
				$listNum--;
				//viewEvent = $bookmarkEvents[$listNum];
				$pageNum = 0;
				bkm = 'pub';
			}
		}}>{'<'}</button
	>

	<button
		on:click={() => {
			if ($bookmarkEvents && $listNum < $bookmarkEvents.length - 1) {
				$pageNum = 0;
				$listNum++;
				//	viewEvent = $bookmarkEvents[$listNum];
				bkm = 'pub';
			}
		}}>{'>'}</button
	> -->
		{#if $searchRelays && $searchRelays.length > 0}
			<NostrApp relays={$searchRelays}>
				<ListedEvent
					listEvent={viewEvent}
					{DeleteNote}
					{MoveNote}
					{CheckNote}
					bind:bkm
					bind:isOwner
				/>
			</NostrApp>
		{:else}
			{`relay has not been set`}
		{/if}
	</main>

	<!-------------------------------あど----->
	{#if !$nowProgress && $pubkey_viewer === pubkey}
		<div class="fixed bottom-14 z-10 w-full inline-flex flex-row space-x-0">
			<div
				class="container max-w-[1024px] mx-auto flex overflow-hidden rounded-token justify-end rounded-none"
			>
				<div class="justify-self-start px-4 z-10 fill-white">
					{#if !$isMulti}
						<button
							class="addIcon btn-icon variant-filled-secondary fill-white hover:variant-ghost-secondary hover:stroke-secondary-500"
							on:click={onClickAdd}>{@html addIcon}</button
						>
					{:else}
						<button
							class="addIcon btn-icon variant-filled-secondary fill-white hover:variant-ghost-secondary hover:stroke-secondary-500"
							on:click={onClickMultiMove}>{@html MoveIcon}</button
						>
						<button
							class="addIcon btn-icon variant-filled-warning fill-white mx-1 hover:variant-ghost-warning hover:stroke-warning-500"
							on:click={onClickMultiDelete}>{@html DeleteIcon}</button
						>
					{/if}
				</div>
			</div>
		</div>
	{/if}
{/if}

<div class="card p-1 variant-filled-secondary z-20" data-popup="popupPub">
	<p>{$_('popup.pub')}</p>
	<div class="arrow variant-filled-secondary z-20" />
</div>
<div class="card p-1 variant-filled-secondary z-20" data-popup="popupPrv">
	<p>{$_('popup.prv')}</p>
	<div class="arrow variant-filled-secondary z-20" />
</div>

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
</style>
