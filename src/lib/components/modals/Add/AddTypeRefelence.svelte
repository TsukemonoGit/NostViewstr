<script lang="ts">
	import { _ } from 'svelte-i18n';

	import { nowProgress } from '$lib/stores/settings';
	import Save from './Save.svelte';
	import PrivateButton from './PrivateButton.svelte';
	import PublicButton from './PublicButton.svelte';

	export let res: { btn: string; tag: string[]; check: boolean };
	export let parent: any;
	export let onFormSubmit: any;
	//export let viewList: string[][];
	export let tag: string[];
	export let bkm: string | undefined;

	export let selectBoxItem: string[];
	export let selectItem: string;

	const myValue = 'Refelence';

	if (!selectBoxItem.includes(myValue)) {
		selectBoxItem.push(myValue);
	}

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

{#if selectItem === myValue}
	<article class="body">
		<span class="dot" /><span class="px-1 font-bold">Reference</span>
	</article>

	<div class="m-2">
		<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] my-1">
			<div
				class="input-group-shim"
				style="padding-left: 4px;padding-right: 4px"
			>
				Name
			</div>
			<input
				class="input px-1 py-1"
				type="text"
				placeholder="link name"
				bind:value={input2}
			/>
		</div>
		<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] mt-2">
			<div
				class="input-group-shim"
				style="padding-left: 11px;padding-right: 11px"
			>
				URL
			</div>
			<input
				class="input px-1 py-1"
				type="text"
				placeholder="http://"
				bind:value={input1}
			/>
		</div>
	</div>
	<!-- <div class="input1-group input1-group-divider grid-cols-[auto_1fr] m-2">
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
</div> -->
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
