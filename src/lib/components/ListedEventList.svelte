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
	import { testRelay } from '$lib/testData/test.js';
	import { bookmarks } from '$lib/testData/bookmarks';
	import backIcon from '@material-design-icons/svg/round/chevron_left.svg?raw';
	import nextIcon from '@material-design-icons/svg/round/chevron_right.svg?raw';
	import DeleteIcon from '@material-design-icons/svg/round/delete.svg?raw';
	import MoveIcon from '@material-design-icons/svg/round/arrow_circle_right.svg?raw';
	import updateIcon from '@material-design-icons/svg/round/update.svg?raw';
	import { searchRelays, postRelays, bookmarkRelays } from '$lib/stores/relays';
	import { isMulti, nowProgress, pubkey_viewer } from '$lib/stores/settings';
	//import type { Event } from 'nostr-tools';
	import { amount, listSize, pageNum } from '$lib/stores/pagination';
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import ModalAddNote from '$lib/components/modals/ModalAddNote.svelte';
	import ModalDelete from '$lib/components/modals/ModalDelete.svelte';
	import { modalStore, toastStore } from '$lib/stores/store';
	import type { Nostr } from 'nosvelte';
	let size: number;
	let bkm: string = 'pub';
	let viewEvent: Nostr.Event<number>;
	export let pubkey: string;
	export let kind: number;
	let isOwner: boolean;
	//let num: number = 0;
	$: createdAt = viewEvent?.created_at;
	$: isOwner = $pubkey_viewer === pubkey;
	onMount(async () => {
		await bkminit(pubkey);
	});
	async function bkminit(pub: string) {
		//console.log(await getRelays(pubkey)); //await setRelays(testRelay);
		if ($pubkey_viewer === undefined || $pubkey_viewer === '') {
			$pubkey_viewer = await getPub();
		}

		console.log($pubkey_viewer);
		console.log(pub);
		console.log(await getRelays(pub));

		const filter = [
			{
				kinds: [kind],
				authors: [pub]
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
	}
	//ページが変わったらチェックリスト空にする
	$: if ($pageNum !== -1 || bkm) {
		$checkedIndexList = [];
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
			} catch (error) {
				const t = {
					message: $_('nprofile.toast.failed_publish'),
					timeout: 3000,
					background: 'bg-orange-500 text-white width-filled '
				};

				toastStore.trigger(t);
			}
		}
	}

	function MoveNote(e: CustomEvent<any>): void {
		console.log('MoveNote');
		const number: number = e.detail.number + $pageNum * $amount;
		console.log(number);
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
			title: $identifierList[$listNum],
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
				try {
					const bkmk = $bookmarkEvents[listNumber];
					//bkm.tags.push(check.tag);
					const event: Nostr.Event = {
						id: '',
						pubkey: bkmk.pubkey,
						created_at: Math.floor(Date.now() / 1000),
						kind: bkmk.kind,
						tags:
							res.btn === 'pub' && check.tag
								? [...bkmk.tags, check.tag]
								: bkmk.tags,
						content:
							res.btn === 'pub'
								? bkmk.content
								: await addPrivates(bkmk.content, bkmk.pubkey, [check.tag]), //ここでエラーの可能性ある
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
		}
		$nowProgress = false;
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
	const borderClassActive = `break-keep border-b-2 border-surface-900-50-token p-2 pb-0 h6`;
	const borderClass = `break-keep border-b border-surface-400-500-token p-2 pb-0 h6`;

	function onClickPage(arg0: number): any {
		$listNum += arg0;
	}

	function onClickMultiMove(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		throw new Error('Function not implemented.');
	}

	function onClickMultiDelete(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		throw new Error('Function not implemented.');
	}
</script>

<!-- {#await bkminit(pubkey) then bkminti} -->
{#if $bookmarkEvents && $bookmarkEvents.length > 0}
	<!--header-->
	<div
		class="z-10 fixed h-[2.5em] top-0 inline-flex flex-row space-x-0 w-screen bg-surface-500 text-white"
	>
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
		<div
			class="min-w-[8rem] variant-ghost-primary border-b border-surface-400-500-token p-2 pb-0 h3 break-keep"
		>
			{$identifierList[$listNum]}
		</div>

		<button
			class={bkm === 'pub' ? borderClassActive : borderClass}
			disabled={bkm === 'pub'}
			on:click={() => {
				bkm = 'pub';
				console.log(bkm);
				$pageNum = 0;
			}}>{$_('public')}</button
		>
		{#if viewEvent?.content !== ''}
			<button
				class={bkm === 'prv' ? borderClassActive : borderClass}
				disabled={bkm === 'prv'}
				on:click={() => {
					bkm = 'prv';
					console.log(bkm);
					$pageNum = 0;
				}}>{$_('private')}</button
			>
		{/if}
		<div class="flex-grow text-right text-sm break-keep">
			{$_('created_at')}<br />
			{new Date(createdAt * 1000).toLocaleString([], {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit'
			})}
		</div>
		<button
			class={'btn p-1 pr-2  arrow'}
			on:click={() => {
				$nowProgress = true;
				updateBkmTag($listNum);
				$nowProgress = false;
			}}>{@html updateIcon}</button
		>
	</div>

	<!---->
	<main class="my-10">
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

		<ListedEvent
			listEvent={viewEvent}
			{DeleteNote}
			{MoveNote}
			{CheckNote}
			bind:bkm
			bind:isOwner
		/>
	</main>

	<!-------------------------------あど----->
	{#if !$nowProgress && $pubkey_viewer === pubkey}
		<div class="fixed bottom-14 z-10 left-2 fill-white">
			{#if !$isMulti}
				<button
					class="addIcon btn-icon variant-filled-primary fill-white"
					on:click={onClickAdd}>{@html addIcon}</button
				>
			{:else}
				<button
					class="addIcon btn-icon variant-filled-primary fill-white"
					on:click={onClickMultiMove}>{@html MoveIcon}</button
				>
				<button
					class="addIcon btn-icon variant-filled-primary fill-warning-400"
					on:click={onClickMultiDelete}>{@html DeleteIcon}</button
				>
			{/if}
		</div>
	{/if}
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
</style>
