<script lang="ts">
	import { MenuMode } from '$lib/otherFunctions.js';
	// import DeleteBtn from './Button/DeleteBtn.svelte';
	// import Share from './Button/Share.svelte';
	// import Move from './Button/Move.svelte';
	// import Open from './Button/Open.svelte';
	import { createEventDispatcher } from 'svelte';
	import { nip19, type Event } from 'nostr-tools';

	import { parseNaddr, windowOpen } from '$lib/nostrFunctions';
	import { checkedIndexList } from '$lib/stores/bookmarkEvents';
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { modalStore } from '$lib/stores/store';
	import { _ } from 'svelte-i18n';
	import ModalPostNote from '$lib/components/modals/ModalPostNote.svelte';
	import type { Nostr } from 'nosvelte';

	import DeleteIcon from '@material-design-icons/svg/round/delete.svg?raw';
	import MoveIcon from '@material-design-icons/svg/round/arrow_circle_right.svg?raw';
	import OpenIcon from '@material-design-icons/svg/round/open_in_browser.svg?raw';
	import ShareIcon from '@material-design-icons/svg/round/chat.svg?raw';
	import EditIcon from '@material-design-icons/svg/round/edit_note.svg?raw';

	import swap from '@material-design-icons/svg/round/swap_vert.svg?raw';

	export let menuMode: MenuMode;
	export let tagArray: string[] | undefined;
	export let note: Event | undefined; //noteないときはwindow openとかできないらしい
	export let myIndex: number | undefined;
	export let share = true; //pたぐのときはシェア不可にしてるらしい
	export let kind: number | undefined;
	export let isNaddr: boolean;
	enum State {
		Default,
		Delete,
		Move,
		Check
	}

	const dispatch = createEventDispatcher();

	function handleClick(state: State) {
		//console.log(state);
		switch (state) {
			case State.Delete:
				dispatch('DeleteNote', {
					number: myIndex,
					event: note,
					tagArray: tagArray
				});
				break;

			case State.Move:
				dispatch('MoveNote', {
					number: myIndex,
					event: note,
					tagArray: tagArray
				});
				break;
			case State.Check:
				dispatch('CheckNote', {
					number: myIndex,
					event: note,
					tagArray: tagArray
				});
				break;
		}
	}
	//https://github.com/nostr-protocol/nips/blob/master/10.md#marked-e-tags-preferred マーカーはオプションだからなくてもいいか
	//リポストの仕様 https://github.com/nostr-protocol/nips/blob/master/18.md

	//-----------------------------------------------引用ポスト
	const postNoteModalComponent: ModalComponent = {
		ref: ModalPostNote
	};
	function shareNote() {
		const tags = tagArray
			? tagArray[0] === 'e'
				? note?.kind !== 1
					? [[...tagArray, '', 'mention']]
					: [['q', ...tagArray.slice(1)]]
				: [tagArray]
			: [];
		const modal: ModalSettings = {
			type: 'component',
			component: postNoteModalComponent,
			backdropClasses: '!bg-surface-400/80 ',
			title: $_('modal.postNote.title'),
			body: ``,
			value: {
				content: `${
					tagArray && tagArray[0] === 'a'
						? `\r\nnostr:${nip19.naddrEncode(parseNaddr(tagArray))}`
						: tagArray && tagArray[0] === 'e'
						? note?.kind === 1
							? `\r\nnostr:${nip19.noteEncode(tagArray[1])}`
							: `\r\nnostr:${nip19.neventEncode({
									id: tagArray[1],
									relays: []
							  })}`
						: ''
				}`,
				tags: tags,
				tagArray: tagArray,
				kind: note?.kind,
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
		event: Nostr.Event<number> | undefined,
		tagArray: string[]
	) {
		if ($checkedIndexList.map((item) => item.index).includes(idx)) {
			$checkedIndexList.splice(
				$checkedIndexList.map((item) => item.index).indexOf(idx),
				1
			);
		} else {
			if (event !== undefined) {
				$checkedIndexList.push({
					index: idx,
					event: event,
					tagArray: tagArray
				});
			} else {
				$checkedIndexList.push({ index: idx, event: {}, tagArray: tagArray });
			}
		}
		//背景色変えるやつ
		//deleteNoteIndexes = checkedIndexList.map((item) => item.index);

		// console.log(idx);
		//  console.log(checkedIndexList);
	}
</script>

{#if menuMode === MenuMode.Owner}
	<div class="grid grid-rows-[auto_1fr] w-14 pt-1">
		<div>
			<button
				class="btn m-0 p-0 bg-surface-500 w-fit fill-white"
				disabled={!share}
				on:click={shareNote}>{@html ShareIcon}</button
			>

			<button
				class="btn m-0 p-0 bg-surface-500 w-fit fill-white"
				disabled={!kind || kind < 30000 || kind >= 40000 || isNaddr}
				on:click={() => handleClick(State.Move)}>{@html MoveIcon}</button
			>
		</div>

		<div>
			<button
				class="btn m-0 p-0 bg-surface-500 w-fit fill-white"
				disabled={note === undefined}
				on:click={() => {
					if (tagArray && note) {
						windowOpen(note.id);
					}
				}}>{@html OpenIcon}</button
			>

			<button
				class="btn m-0 p-0 bg-surface-500 w-fit fill-warning-400"
				on:click={() => {
					handleClick(State.Delete);
				}}>{@html DeleteIcon}</button
			>
		</div>
	</div>
{:else if menuMode === MenuMode.Viewer}
	<!--修正ボタンなし-->
	{#if share || note !== undefined}
		<div class="flex flex-col w-7">
			<button
				class="btn m-0 p-0 mb-1 bg-surface-500 w-fit fill-white"
				disabled={!share}
				on:click={shareNote}>{@html ShareIcon}</button
			>

			{#if note}
				<button
					class="btn m-0 p-0 bg-surface-500 w-fit fill-white"
					on:click={() => {
						if (tagArray && note) {
							windowOpen(note.id);
						}
					}}>{@html OpenIcon}</button
				>
			{/if}
		</div>
	{/if}
{:else if menuMode === MenuMode.Multi}
	<!--複数選択モード-->
	<input
		class="m-2 checkbox scale-125 w-fit"
		type="checkbox"
		checked={$checkedIndexList
			.map((item) => item.index)
			.includes(myIndex !== undefined ? myIndex : -1)}
		on:change={() => {
			if (myIndex !== undefined && tagArray !== undefined) {
				onChangeCheckList(myIndex, note, tagArray);
				handleClick(State.Check);
			}
		}}
	/>
{:else if menuMode === MenuMode.other}<!--修正だけ（シェアなし）-->

	<div class="flex flex-col w-fit">
		<button
			class="btn m-0 p-0 mb-1 bg-surface-500 w-fit fill-white"
			disabled={!kind || kind < 30000 || kind >= 40000}
			on:click={() => handleClick(State.Move)}>{@html MoveIcon}</button
		>

		<button
			class="btn m-0 p-0 bg-surface-500 w-fit fill-warning-400"
			on:click={() => {
				handleClick(State.Delete);
			}}>{@html DeleteIcon}</button
		>
	</div>
{:else if menuMode === MenuMode.Sort}
	<!--sortモード-->
	<div class="fill-white">
		{@html swap}
	</div>
{:else}
	<div />
{/if}
