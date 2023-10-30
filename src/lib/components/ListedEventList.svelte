<script lang="ts">
	import ListedEvent from '$lib/components/ListedEvent.svelte';
	//import { listEvent } from '$lib/testData/list';
	import { bookmarkEvents } from '$lib/stores/bookmarkEvents';
	import {
		fetchFilteredEvents,
		getRelays,
		setRelays
	} from '$lib/nostrFunctions';
	import { onMount } from 'svelte';
	import { testRelay } from '$lib/testData/test.js';
	import { bookmarks } from '$lib/testData/bookmarks';
	import { searchRelays, postRelays, bookmarkRelays } from '$lib/stores/relays';
	import type { Event } from 'nostr-tools';
	import { amount, listSize, pageNum } from '$lib/stores/pagination';
	let size: number;
	let bkm: string = 'pub';
	let viewEvent: Event<number>;

	onMount(async () => {
		//console.log(await getRelays(data.pubkey));

		// const filter = [
		// 	{
		// 		kinds: [30001],
		// 		authors: [
		// 			data.pubkey
		// 		]
		// 	}
		// ];
		// const res = await fetchFilteredEvents($bookmarkRelays, filter);

		await setRelays(testRelay);
		const res = bookmarks;
		if (res.length === 0) {
			return;
		}
		$bookmarkEvents = res;
		viewEvent = $bookmarkEvents[0];
		console.log(res);
	});

	function DeleteNote(e: CustomEvent<any>): void {
		console.log('DeleteNote');
		console.log(e.detail.number);
	}

	function MoveNote(e: CustomEvent<any>): void {
		console.log('MoveNote');
		console.log(e.detail.number);
	}

	function CheckNote(e: CustomEvent<any>): void {
		console.log('CheckNote');
		console.log(e.detail.number);
	}
	$: console.log(size);

	function next(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if ($pageNum < Math.floor($listSize) / $amount) {
			$pageNum++;
		}
	}

	function back(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if ($pageNum > 0) {
			$pageNum--;
		}
	}
</script>

<button
	on:click={() => {
		bkm = bkm === 'pub' ? 'prv' : 'pub';
		console.log(bkm);
		$pageNum = 0;
	}}>test</button
>
<button on:click={next}>{'>'}</button>
<button on:click={back}>{'<'}</button>

<ListedEvent
	listEvent={viewEvent}
	{DeleteNote}
	{MoveNote}
	{CheckNote}
	bind:bkm
/>
