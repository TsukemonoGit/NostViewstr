<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { toastStore } from '$lib/stores/store';

	import PublicButton from './PublicButton.svelte';
	import { Nip11Registry } from 'rx-nostr';
	import { normalizeURL } from 'nostr-tools/utils';

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
		try {
			input = normalizeURL(input);
		} catch (error) {
			// invalid url
			const t = {
				message: 'Invalid URL',
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
			return;
		}
		//同じリレーがないかチェック
		const index = viewList?.findIndex((tag) => {
			try {
				const modifiedTag = normalizeURL(tag[1]);
				return modifiedTag === input;
			} catch (error) {
				return false;
			}
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
		const info = Nip11Registry.get(input);
		try {
			const existRelay = !info ? await Nip11Registry.fetch(input) : info;

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
