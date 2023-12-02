<script lang="ts">
	import { checkInputNpub, checkRelayExist } from '$lib/nostrFunctions';
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';
	import type { Nostr } from 'nosvelte';

	export let res: { btn: string; tag: string[] };
	export let parent: any;
	export let onFormSubmit: any;
	export let event: Nostr.Event;

	let input: string = '';

	let selectValue: string;

	async function onClickCheck() {
		//
		input = input.trim();
		if (input === '') {
			return;
		}

		if (!input.endsWith('/')) {
			input += '/';
		}
		const index = event.tags.findIndex((tag) => {
			const modifiedTag = tag[1].endsWith('/') ? tag[1] : tag[1] + '/';
			return modifiedTag === input;
		});
		if (index !== -1) {
			//同じリストに同じ名前のあったら無効
			const t = {
				message: $_('toast.invalidEmoji'),
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
			return;
		}

		const existRelay = await checkRelayExist(input);
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
					: ['r', input, selectValue === 'read' ? 'read' : 'white'];
			console.log(res.tag);
			onFormSubmit();
		}
	}
</script>

<!-- Enable for debugging: -->
<article class="body">
	{`input relay url and select type `}
</article>
<div
	class="mt-2 input-group input-group-divider grid-rows-[auto_auto_auto_auto]"
>
	<div class="input-group-shim">relay url</div>
	<input
		class="input p-2 my-2 w-full"
		type="text"
		bind:value={input}
		placeholder="wss://..."
	/>
	<div class="input-group-shim">type</div>
	<select class="input p-1" bind:value={selectValue}
		><option value="both">read/white</option>
		<option value="write">write</option>
		<option value="read">read</option>
	</select>
</div>

<footer class=" gap-2 flex flex-wrap justify-end mt-2">
	<button
		class="btn {parent.buttonPositive}"
		on:click={() => {
			res.btn = 'pub';
			onClickCheck();
		}}>SAVE</button
	>
</footer>
