<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { tagExp } from '$lib/kind';
	import { nowProgress } from '$lib/stores/settings';

	export let res: { btn: string; tag: string[]; check: boolean };
	export let parent: any;
	export let onFormSubmit: any;
	//export let viewList: string[][];
	export let tag: string[];
	export let countCharacters: string[];
	export let bkm: string | undefined;
	let selectValue: string = tag ? tag[0] : countCharacters[0];
	$: placeholder = selectValue === 'r' ? 'url' : 'word';
	let input: string = tag ? tag[1] : '';

	async function onClickCheck() {
		if (input == '') {
			return;
		}
		//console.log(selectValue);
		res.tag = [selectValue, input];
		res.check = true;
		onFormSubmit();
	}
</script>

<!-- Enable for debugging: -->
<article class="body">
	{#each countCharacters as value (value)}
		<span class="px-1">{tagExp[value]} ,</span>
	{/each}
</article>

<div class="input-group input-group-divider grid-cols-[auto_1fr] m-2">
	<select class="input-group-shim select px-1" bind:value={selectValue}>
		{#each countCharacters as value (value)}
			<option {value}>{tagExp[value]}</option>
		{/each}
	</select>

	<input class="input px-1" type="text" {placeholder} bind:value={input} />
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
