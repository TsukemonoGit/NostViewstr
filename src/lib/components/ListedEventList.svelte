<script lang="ts">
	import { _ } from 'svelte-i18n';
	import addIcon from '@material-design-icons/svg/round/bookmark_add.svg?raw';

	import ListedEvent from '$lib/components/ListedEvent.svelte';
	//import { listEvent } from '$lib/testData/list';
	import {
		bookmarkEvents,
		identifierList,
		listNum
	} from '$lib/stores/bookmarkEvents';
	import {
		addPrivate,
		checkInput,
		fetchFilteredEvents,
		getPub,
		getRelays,
		isOneDimensionalArray,
		publishEventWithTimeout,
		setRelays,
		updateBkmTag
	} from '$lib/nostrFunctions';
	import { onMount } from 'svelte';
	import { testRelay } from '$lib/testData/test.js';
	import { bookmarks } from '$lib/testData/bookmarks';
	import { searchRelays, postRelays, bookmarkRelays } from '$lib/stores/relays';
	import { nowProgress, pubkey_viewer } from '$lib/stores/settings';
	//import type { Event } from 'nostr-tools';
	import { amount, listSize, pageNum } from '$lib/stores/pagination';
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import ModalAddNote from '$lib/components/modals/ModalAddNote.svelte';
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
		isOwner = $pubkey_viewer === pubkey;
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
		$pageNum = 0;
	}

	function DeleteNote(e: CustomEvent<any>): void {
		console.log('DeleteNote');
		const number: number = e.detail.number + $pageNum * $amount;
		console.log(number);
	}

	function MoveNote(e: CustomEvent<any>): void {
		console.log('MoveNote');
		const number: number = e.detail.number + $pageNum * $amount;
		console.log(number);
	}

	function CheckNote(e: CustomEvent<any>): void {
		console.log('CheckNote');
		const number: number = e.detail.number + $pageNum * $amount;
		console.log(number);
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
			const bkm = $bookmarkEvents[listNumber];
			//bkm.tags.push(check.tag);
			const event: Nostr.Event = {
				id: '',
				pubkey: bkm.pubkey,
				created_at: Math.floor(Date.now() / 1000),
				kind: bkm.kind,
				tags:
					res.btn === 'pub' && check.tag ? [...bkm.tags, check.tag] : bkm.tags,
				content:
					res.btn === 'pub'
						? bkm.content
						: await addPrivate(bkm.content, bkm.pubkey, [check.tag]),
				sig: ''
			};
			const result = await publishEventWithTimeout(event, $bookmarkRelays);
			//   console.log(result);
			if (result.isSuccess && $bookmarkEvents && result.event) {
				$bookmarkEvents[listNumber] = result.event;
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

		$nowProgress = false;
	}
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
</script>

<!-- {#await bkminit(pubkey) then bkminti} -->
{#if $bookmarkEvents && $bookmarkEvents.length > 0}
	<!--header-->
	<div
		class="z-10 fixed h-[2.5em] top-0 inline-flex flex-row space-x-0 w-screen bg-surface-500 text-white"
	>
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
		<div class="flex-grow text-right text-sm break-keep pr-2">
			{$_('created_at')}<br />
			{new Date(createdAt * 1000).toLocaleString([], {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit'
			})}
		</div>
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
	{#if $pubkey_viewer === pubkey && !$nowProgress}
		<div class="fixed bottom-14 z-10 left-2 fill-white">
			<button
				id="addIcon"
				class=" btn-icon variant-filled-primary"
				on:click={onClickAdd}>{@html addIcon}</button
			>
		</div>
	{/if}
{/if}

<!-- {/await} -->

<style>
	:global(#addIcon svg) {
		width: 1.5em;
		height: 1.5em;
		fill: white;
	}
</style>
