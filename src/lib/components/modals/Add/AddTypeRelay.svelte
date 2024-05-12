<script lang="ts">
	import { checkInputNote } from '$lib/nostrFunctions';
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';

	import type Nostr from 'nostr-typedef';
	import PublicButton from './PublicButton.svelte';
	import { Nip11Registry } from 'rx-nostr';

	export let res: { btn: string; tag: string[] };
	export let parent: any;
	export let onFormSubmit: any;
	//export let event: Nostr.Event;
	export let tag: string[];
	export let number: number;
	export let viewList: string[][];

	export let selectBoxItem: string[];
	export let selectItem: string;

	const myValue = 'Relay';

	if (!selectBoxItem.includes(myValue)) {
		selectBoxItem.push(myValue);
	}

	let input: string = tag ? tag[1] : '';

	async function onClickCheck() {
		//
		input = input.trim();
		if (input === '') {
			return;
		}

		if (!input.endsWith('/')) {
			input += '/';
		}

		const index = viewList?.findIndex((tag) => {
			const modifiedTag = tag[1].endsWith('/') ? tag[1] : tag[1] + '/';
			return modifiedTag === input;
		});

		// myIndex と index が一致する場合は処理をスキップ
		if (index !== -1 && number !== index) {
			// 同じリストに同じ名前のあったら無効
			const t = {
				message: $_('toast.invalidEmoji'),
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
			return;
		}

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
			res.tag = ['relay', input];
			console.log(res.tag);
			onFormSubmit();
		}
	}

	let inputElement: HTMLInputElement;
	$: if (selectItem === myValue && inputElement) {
		inputElement.focus();
	}
</script>

{#if selectItem === myValue}
	<article class="body">
		<span class="dot" /><span class="px-1 font-bold">Relay</span>
	</article>
	<!-- Enable for debugging: -->
	<div class="p-2">
		<input
			bind:this={inputElement}
			class="input p-2"
			type="text"
			bind:value={input}
			placeholder="wss://..."
		/>
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
