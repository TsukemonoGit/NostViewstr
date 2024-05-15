<script lang="ts">
	//selectKindList.svelte
	import { kinds, sortedKinds } from '$lib/kind';
	import { kindSortToggle } from '$lib/stores/settings';

	$: selectedKinds = $kindSortToggle ? kinds : sortedKinds;
	export let buttonClass: string = '';
	export let divClass: string = '';

	export let selectValue: string;
</script>

<slot kindList={selectedKinds} />
<!--iconとかURLとかの表示切替-->
<div class={divClass}>
	<button
		type="button"
		title={$kindSortToggle ? 'Sort by kind' : 'Sort alphabetically'}
		class="btn mx-1 p-0 w-[25px] h-[25px] rounded-full variant-ghost-tertiary {buttonClass}"
		on:click={() => {
			$kindSortToggle = !$kindSortToggle;
			//<selectのoptionのvalueにnumberいれたらselectに表示されないし、optionの部分だけvalueにしても↓のぶぶんがあかんくなるから
			//並べ替えてもセレクトされた位置が変わらないからなんかあれする
			const tmp = selectValue;
			selectValue = '';
			selectValue = tmp;
		}}>{$kindSortToggle ? 1 : 'A'}</button
	>
</div>
