<script lang="ts">
	//selectKindList.svelte
	import { kinds, sortedKinds } from '$lib/kind';
	import { kindSortToggle } from '$lib/stores/settings';

	$: selectedKinds = $kindSortToggle ? kinds : sortedKinds;
	export let buttonClass: string = '';
	export let divClass: string = '';
	export let size: string = '25px';
	export let selectValue: string;
	export let visible: boolean = true;
</script>

<slot kindList={selectedKinds} />
<!--iconとかURLとかの表示切替-->
{#if visible}
	<div class={divClass}>
		<button
			type="button"
			title={$kindSortToggle ? 'Sort by kind' : 'Sort alphabetically'}
			class="btn mx-1 p-0 rounded-full variant-ghost-tertiary {buttonClass}"
			style="width:{size} ; height:{size}"
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
{/if}
