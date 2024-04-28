<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { nowProgress } from '$lib/stores/settings';

	export let res: { btn: string; tag: string[]; check: boolean };
	export let parent: any;
	export let onFormSubmit: any;
	//export let viewList: string[][];
	export let tag: string[];
	export let bkm: string | undefined;

	let input1: string = tag?.length > 1 ? tag[1] : '';
	let input2: string = tag?.length > 2 ? tag[2] : '';

	async function onClickCheck() {
		if (input1 == '') {
			return;
		}
		//console.log(selectValue);
		res.tag = input2 !== '' ? ['r', input1, input2] : ['r', input1];
		res.check = true;
		onFormSubmit();
	}
</script>

<!-- Enable for debugging: -->
<article class="body">
	<span class="dot" /><span class="px-1 font-bold">Reference</span>
</article>

<div class="input1-group input1-group-divider grid-cols-[auto_1fr] m-2">
	<label class="label mt-1">
		<span>Link Name (not required)</span>
		<input
			class="input px-1 py-1"
			type="text"
			placeholder="link name"
			bind:value={input2}
		/></label
	>
	<label class="label mt-1"
		><span>URL</span>
		<input
			class="input px-1 py-1"
			type="text"
			placeholder="http://"
			bind:value={input1}
		/></label
	>
</div>
<footer class=" gap-2 flex flex-wrap justify-end mt-2">
	{#if bkm !== undefined}
		<!--編集のとき-->
		<button
			class="btn variant-filled-warning {parent.buttonPositive}"
			on:click={() => {
				if (bkm !== undefined) {
					res.btn = bkm;
					onClickCheck();
				}
			}}
			disabled={$nowProgress}>SAVE</button
		>
	{:else}
		<!--新規追加のとき-->
		<button
			class="btn variant-filled-warning {parent.buttonPositive}"
			on:click={() => {
				res.btn = 'prv';
				onClickCheck();
			}}
			disabled={$nowProgress}>Private</button
		>
		<button
			class="btn {parent.buttonPositive}"
			on:click={() => {
				res.btn = 'pub';
				onClickCheck();
			}}
			disabled={$nowProgress}>Public</button
		>
	{/if}
</footer>
