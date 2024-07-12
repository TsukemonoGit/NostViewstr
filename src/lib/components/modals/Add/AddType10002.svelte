<script lang="ts">
	import { checkInputNpub } from '$lib/nostrFunctions';
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';

	import PublicButton from './PublicButton.svelte';
	import { Nip11Registry } from 'rx-nostr';
	import { nowProgress } from '$lib/stores/settings';

	export let res: { btn: string; tag: string[]; check: boolean };
	export let parent: any;
	export let onFormSubmit: any;
	//export let event: Nostr.Event;
	export let tag: string[]; //編集の場合はここに初期値が

	export let selectBoxItem: string[];
	export let selectItem: string;

	const myValue = 'Relay';

	if (!selectBoxItem.includes(myValue)) {
		selectBoxItem.push(myValue);
	}

	let input: string = tag ? tag[1] : '';

	let selectValue: string = getSelectValue(tag);
	function getSelectValue(tag: string[]): string {
		// タグが存在しない場合はデフォルトで 'both' を返す
		if (!tag) {
			return 'both';
		}

		// タグが2文字の場合は 'both' を返す
		if (tag.length === 2) {
			return 'both';
		}

		// タグが3文字の場合
		if (tag.length === 3) {
			// かつ3番目の文字が 'read' の場合は 'read' を返す
			if (tag[2] === 'read') {
				return 'read';
			}
			// かつ3番目の文字が 'write' の場合は 'write' を返す
			else if (tag[2] === 'write') {
				return 'write';
			}
		}

		// 上記の条件に該当しない場合はデフォルトで 'both' を返す
		return 'both';
	}

	async function onClickCheck() {
		//
		input = input.trim();
		if (input === '') {
			return;
		}

		if (!input.endsWith('/')) {
			input += '/';
		}
		try {
			const existRelay = await Nip11Registry.fetch(input);
			if (!existRelay) {
				const t = {
					message: `${$_('toast.checkRelay')}`,
					timeout: 3000,
					background: 'bg-orange-500 text-white width-filled '
				};

				toastStore.trigger(t);
				//		$nowProgress = false;
				return;
			} else {
				res.tag =
					selectValue === 'both'
						? ['r', input]
						: ['r', input, selectValue === 'read' ? 'read' : 'write'];
				console.log(res.tag);
				res.check = true;
				onFormSubmit();
			}
		} catch (error) {
			const t = {
				message: `${$_('toast.checkRelay')}`,
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
			//		$nowProgress = false;
			return;
		}
		// const index = viewList?.findIndex((tag) => {
		// 	const modifiedTag = tag[1].endsWith('/') ? tag[1] : tag[1] + '/';
		// 	return modifiedTag === input;
		// });
		// console.log(index, number);
		// // myIndex と index が一致する場合は処理をスキップ
		// if (index !== -1 && number !== index) {
		// 	// 同じリストに同じ名前のあったら無効
		// 	const t = {
		// 		message: $_('toast.invalidEmoji'),
		// 		timeout: 3000,
		// 		background: 'bg-orange-500 text-white width-filled '
		// 	};

		// 	toastStore.trigger(t);
		// 	return;
		// }
		// $nowProgress = true;
		// const info = Nip11Registry.get(input);

		// const existRelay = !info ? await Nip11Registry.fetch(input) : info;

		// $nowProgress = false;
		// console.log(existRelay);
		// if (!existRelay.name) {
		// 	const t = {
		// 		message: `${$_('toast.checkRelay')}`,
		// 		timeout: 3000,
		// 		background: 'bg-orange-500 text-white width-filled '
		// 	};

		// 	toastStore.trigger(t);
		// 	//		$nowProgress = false;
		// 	return;
		// } else {
		// res.tag =
		// 	selectValue === 'both'
		// 		? ['r', input]
		// 		: ['r', input, selectValue === 'read' ? 'read' : 'write'];
		// console.log(res.tag);
		// res.check = true;
		// onFormSubmit();
		//}
	}

	let inputElement: HTMLInputElement;
	$: if (selectItem === myValue && inputElement) {
		inputElement.focus();
	}
</script>

{#if selectItem === myValue}
	<!-- Enable for debugging: -->
	<article class="body">
		<span class="dot" /><span class="px-1 font-bold">Relay</span>
	</article>
	<div
		class="mt-2 input-group input-group-divider grid-rows-[auto_auto_auto_auto]"
	>
		<div class="input-group-shim">relay url</div>
		<input
			bind:this={inputElement}
			class="input p-2 my-2 w-full"
			type="text"
			bind:value={input}
			placeholder="wss://..."
		/>
		<div class="input-group-shim">type</div>
		<select class="select" bind:value={selectValue}
			><option value="both">read/write</option>
			<option value="write">write</option>
			<option value="read">read</option>
		</select>
	</div>

	<footer class=" gap-2 flex flex-wrap justify-end mt-2">
		<PublicButton
			handleClickPub={() => {
				res.btn = 'pub';
				onClickCheck();
			}}
			{parent}
		/>
	</footer>
{/if}
