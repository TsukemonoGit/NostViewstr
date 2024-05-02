<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { tagExp } from '$lib/kind';
	import { nowProgress } from '$lib/stores/settings';
	import PublicButton from './PublicButton.svelte';
	import PrivateButton from './PrivateButton.svelte';
	import Save from './Save.svelte';

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
	<span class="dot" />{#each countCharacters as value (value)}
		<span class="px-1 font-bold">{tagExp[value]} </span>
	{/each}
</article>

<div class="input-group input-group-divider grid-cols-[auto_1fr] m-2">
	<select
		class="input-group-shim select px-1 max-w-full"
		bind:value={selectValue}
	>
		{#each countCharacters as value (value)}
			<option {value}>{tagExp[value]}</option>
		{/each}
	</select>

	<input class="input px-1" type="text" {placeholder} bind:value={input} />
</div>

<footer class=" gap-2 flex flex-wrap justify-end mt-2">
	{#if bkm !== undefined}
		<!--編集のとき-->
		<Save
			handleClickPub={() => {
				if (bkm !== undefined) {
					res.btn = bkm;
					onClickCheck();
				}
			}}
			{parent}
		/>
	{:else}
		<!--新規追加のとき-->
		<PublicButton
			handleClickPub={() => {
				res.btn = 'pub';
				onClickCheck();
			}}
			{parent}
		/>
		<PrivateButton
			handleClickPrv={() => {
				res.btn = 'prv';
				onClickCheck();
			}}
			{parent}
		/>
	{/if}
</footer>
