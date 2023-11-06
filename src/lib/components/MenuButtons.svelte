<script lang="ts">
	import { MenuMode } from '$lib/functions';
	import DeleteBtn from './Button/DeleteBtn.svelte';
	import Share from './Button/Share.svelte';
	import Move from './Button/Move.svelte';
	import Open from './Button/Open.svelte';
	import { createEventDispatcher } from 'svelte';
	import { nip19, type Event } from 'nostr-tools';

	import { parseNaddr, windowOpen } from '$lib/nostrFunctions';
	import { checkedIndexList } from '$lib/stores/bookmarkEvents';
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { modalStore } from '$lib/stores/store';
	import { _ } from 'svelte-i18n';
	import ModalPostNote from '$lib/components/modals/ModalPostNote.svelte';
	import type { Nostr } from 'nosvelte';
	export let menuMode: MenuMode;
	export let tagArray: string[] | undefined;
	export let note: Event | undefined;
	export let myIndex: number | undefined;

	enum State {
		Default,
		Delete,
		Move,
		Check
	}

	const dispatch = createEventDispatcher();

	function handleClick(state: State) {
		switch (state) {
			case State.Delete:
				dispatch('DeleteNote', { number: myIndex });
				break;

			case State.Move:
				dispatch('MoveNote', { number: myIndex });
				break;
			case State.Check:
				dispatch('CheckNote', { number: myIndex });
				break;
		}
	}

	//-----------------------------------------------引用ポスト
	const postNoteModalComponent: ModalComponent = {
		ref: ModalPostNote
	};
	function shareNote() {
		const tags = tagArray
			? tagArray[0] === 'e'
				? [[...tagArray, '', 'mention']]
				: [tagArray]
			: [];
		const modal: ModalSettings = {
			type: 'component',
			component: postNoteModalComponent,
			backdropClasses: '!bg-surface-400/80 ',
			title: $_('nprofile.modal.postNote.title'),
			body: ``,
			value: {
				content: `${
					tagArray && tagArray[0] === 'a'
						? `\r\nnostr:${nip19.naddrEncode(parseNaddr(tagArray))}`
						: tagArray && tagArray[0] === 'e'
						? `\r\nnostr:${nip19.noteEncode(tagArray[1])}`
						: ''
				}`,
				tags: tags,
				pubkey: note?.pubkey
			}
			// response: async (res) => {
			// 	console.log(res);
			// 	if (res) {
			// 		//帰ってきた値によってなんやかんや
			// 		//でもポストノートは別に戻ってきてからやんなくても良くない？
			// 	}
			// }
		};
		modalStore.trigger(modal);
	}

	function onChangeCheckList(
		idx: number,
		event: Nostr.Event<number> | undefined
	) {
		if ($checkedIndexList.map((item) => item.index).includes(idx)) {
			$checkedIndexList.splice(
				$checkedIndexList.map((item) => item.index).indexOf(idx),
				1
			);
		} else {
			if (event !== undefined) {
				$checkedIndexList.push({ index: idx, event: event });
			} else {
				$checkedIndexList.push({ index: idx, event: {} });
			}
		}
		//背景色変えるやつ
		//deleteNoteIndexes = checkedIndexList.map((item) => item.index);

		// console.log(idx);
		//  console.log(checkedIndexList);
	}
</script>

{#if menuMode === MenuMode.Owner}
	<div class="grid grid-rows-[auto_1fr] w-14">
		<div>
			<button class="btn m-0 p-0 bg-surface-500" on:click={shareNote}
				><Share /></button
			>
			<button
				class="btn m-0 p-0 bg-surface-500"
				on:click={() => handleClick(State.Move)}><Move /></button
			>
		</div>
		{#if note}
			<div>
				<button
					class="btn m-0 p-0 bg-surface-500"
					on:click={() => {
						if (tagArray && note) {
							windowOpen(note.id);
						}
					}}><Open /></button
				>
				<button
					class="btn m-0 p-0 bg-surface-500"
					on:click={() => {
						handleClick(State.Delete);
					}}><DeleteBtn /></button
				>
			</div>
		{/if}
	</div>
{:else if menuMode === MenuMode.Viewer}
	<!--修正ボタンなし-->
	<div class="flex flex-col">
		<button class="btn m-0 p-0 mb-1 bg-surface-500" on:click={shareNote}
			><Share /></button
		>
		{#if note}
			<button
				class="btn m-0 p-0 bg-surface-500"
				on:click={() => {
					if (tagArray && note) {
						windowOpen(note.id);
					}
				}}><Open /></button
			>
		{/if}
	</div>
{:else if menuMode === MenuMode.Multi}
	<!--複数選択モード-->
	<input
		class="m-2 checkbox scale-125"
		type="checkbox"
		checked={$checkedIndexList
			.map((item) => item.index)
			.includes(myIndex !== undefined ? myIndex : -1)}
		on:change={() => {
			if (myIndex !== undefined) {
				onChangeCheckList(myIndex, note);
				handleClick(State.Check);
			}
		}}
	/>
{:else if menuMode === MenuMode.other}<!--修正だけ（シェアなし）-->

	<div class="flex flex-col">
		<button
			class="btn m-0 p-0 mb-1 bg-surface-500"
			on:click={() => handleClick(State.Move)}><Move /></button
		>

		<button
			class="btn m-0 p-0 bg-surface-500"
			on:click={() => {
				handleClick(State.Delete);
			}}><DeleteBtn /></button
		>
	</div>
{:else}
	<div />
{/if}
