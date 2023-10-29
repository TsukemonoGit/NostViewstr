<script lang="ts">
	import ListedEvent from '$lib/components/ListedEvent.svelte';
	import { listEvent } from '$lib/testData/list';

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
	let bkm: string = 'pub';
</script>

<button
	on:click={() => {
		bkm = bkm === 'pub' ? 'prv' : 'pub';
	}}>test</button
>
<ListedEvent {listEvent} {DeleteNote} {MoveNote} {CheckNote} {bkm} />
