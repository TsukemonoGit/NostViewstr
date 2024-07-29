<script lang="ts">
	import { _ } from 'svelte-i18n';

	import PublicButton from './PublicButton.svelte';
	import PrivateButton from './PrivateButton.svelte';
	import Save from './Save.svelte';

	export let res: { btn: string; tag: string[]; check: boolean };
	export let parent: any;
	export let onFormSubmit: any;
	//export let viewList: string[][];
	export let tag: string[];
	//export let countCharacters: string[];
	export let bkm: string | undefined;

	export let tagKind: string;
	export let selectBoxItem: string[];
	export let selectItem: string;

	const myValue = tagKind === 't' ? 'HashTag' : 'Word';

	if (!selectBoxItem.includes(myValue)) {
		selectBoxItem.push(myValue);
	}

	// let selectValue: string = tag ? tag[0] : countCharacters[0];
	// $: placeholder = selectValue === 'r' ? 'url' : 'word';
	let input: string = tag ? tag[1] : '';

	async function onClickCheck() {
		if (input == '') {
			return;
		}
		//console.log(selectValue);
		res.tag = [tagKind, input];
		res.check = true;
		onFormSubmit();
	}

	let inputElement: HTMLInputElement;
	$: if (selectItem === myValue && inputElement) {
		inputElement.focus();
	}
</script>

{#if selectItem === myValue}
	<article class="body">
		<span class="dot" /><span class="px-1 font-bold">{myValue}</span>
	</article>
	<div class="p-2">
		<input
			bind:this={inputElement}
			class="input p-2"
			type="text"
			placeholder={myValue}
			bind:value={input}
		/>
	</div>

	<!-- <div class="input-group input-group-divider grid-cols-[auto_1fr] m-2" /> -->

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
{/if}
