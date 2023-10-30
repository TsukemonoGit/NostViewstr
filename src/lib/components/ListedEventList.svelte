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
	const borderClassActive = `break-keep border-b-2 border-surface-900-50-token p-2 pb-0`;
	const borderClass = `break-keep border-b border-surface-400-500-token p-2 pb-0 h4`;
</script>

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
<div
	class="z-10 fixed top-0 inline-flex flex-row space-x-0 w-screen bg-surface-500 text-white"
>
	<div
		class="min-w-[8rem] variant-ghost-primary border-b border-surface-400-500-token p-2 pb-0 h3 break-keep"
	>
		{identifier}
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
	<div class="flex-grow text-right h6 break-keep">
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
