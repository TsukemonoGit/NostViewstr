<script lang="ts">
	import { _ } from 'svelte-i18n';
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
	let num: number = 0;
	$: createdAt = viewEvent?.created_at;
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
	let identifier: string;
	$: if ($bookmarkEvents) {
		const index = $bookmarkEvents[num].tags.find((item) => item[0] === 'd');
		if (index) {
			identifier = index[1];
		} else {
			identifier = ''; // マッチする要素が見つからない場合のデフォルト値
		}
		console.log(identifier);
	}
</script>

<button
	on:click={() => {
		bkm = bkm === 'pub' ? 'prv' : 'pub';
		console.log(bkm);
		$pageNum = 0;
	}}>test</button
>
<div />
<button
	on:click={() => {
		if ($bookmarkEvents && num > 0) {
			num--;
			viewEvent = $bookmarkEvents[num];
			$pageNum = 0;
			bkm = 'pub';
		}
	}}>{'<'}</button
>

<button
	on:click={() => {
		if ($bookmarkEvents && num < $bookmarkEvents.length - 1) {
			$pageNum = 0;
			num++;
			viewEvent = $bookmarkEvents[num];
			bkm = 'pub';
		}
	}}>{'>'}</button
>

<div />
<div class="grid grid-cols-[1fr_auto]">
	<div>
		{identifier}
	</div>
	<div>
		{$_('created_at')}{new Date(createdAt * 1000).toLocaleString()}
	</div>
</div>
<ListedEvent
	listEvent={viewEvent}
	{DeleteNote}
	{MoveNote}
	{CheckNote}
	bind:bkm
/>

<div class=" fixed bottom-14 z-10 left-2">
	<button class="btn-icon variant-filled-primary">+</button>
</div>
