<script lang="ts">
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import type { Nostr } from 'nosvelte';
	import { MultiMenu, isMulti } from '$lib/stores/settings';
	import swap from '@material-design-icons/svg/round/swap_vert.svg?raw';
	import { checkedIndexList } from '$lib/stores/bookmarkEvents';
	import type { SelectIndex } from '$lib/otherFunctions';
	export let popupCombobox: PopupSettings;
	export let setSelectedIndex: SelectIndex;
	export let selectedIndex: SelectIndex;
	export let CheckNote: (e: SelectIndex) => void;

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

{#if $isMulti === MultiMenu.None}
	<button
		class="fill-white btn btn-sm variant-filled-primary h-fit text-sm p-1"
		use:popup={popupCombobox}
		on:click={() => {
			selectedIndex = setSelectedIndex;
		}}
	>
		{'Menu'}
	</button>
{:else if $isMulti === MultiMenu.Multi}
	<!--複数選択モード-->
	<input
		class="m-2 checkbox scale-125 w-fit"
		type="checkbox"
		checked={$checkedIndexList
			.map((item) => item.index)
			.includes(
				setSelectedIndex.detail.number !== undefined
					? setSelectedIndex.detail.number
					: -1
			)}
		on:change={() => {
			if (
				setSelectedIndex.detail.number !== undefined &&
				setSelectedIndex.detail.tagArray !== undefined
			) {
				onChangeCheckList(
					setSelectedIndex.detail.number,
					setSelectedIndex.detail.event,
					setSelectedIndex.detail.tagArray
				);
				CheckNote(setSelectedIndex);
			}
		}}
	/>
{:else}
	<!--sortモード-->
	<div class=" fill-black dark:fill-white swap items-center flex">
		{@html swap}
	</div>
{/if}
