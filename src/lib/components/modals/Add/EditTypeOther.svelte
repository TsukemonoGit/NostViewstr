<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { tagExp } from '$lib/kind';
	import { nowProgress } from '$lib/stores/settings';

	export let res: { btn: string; tag: string[]; check: boolean };
	export let parent: any;
	export let onFormSubmit: any;
	//export let viewList: string[][];
	export let tag: string[];
	export let bkm: undefined | string;
	let input: string = tag ? tag[1] : '';

	async function onClickCheck() {
		if (input == '') {
			return;
		}
		//console.log(selectValue);
		res.tag = [tag[0], input];
		res.check = true;
		onFormSubmit();
	}
</script>

<!-- Enable for debugging: -->
<article class="body">
	<span class="dot" /><span class="px-1 font-bold">{tag[0]}</span>
</article>
<div class="input-group input-group-divider grid-cols-[auto_1fr] m-2">
	<div class="my-2">{tag[0]}</div>

	<input class="input px-1" type="text" bind:value={input} />
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
