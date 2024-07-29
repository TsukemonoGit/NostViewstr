<script lang="ts">
	import { checkInputNaddr } from '$lib/nostrFunctions';
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';

	import PublicButton from './PublicButton.svelte';
	import PrivateButton from './PrivateButton.svelte';
	export let res: { btn: string; tag: string[] };
	export let parent: any;
	export let onFormSubmit: any;

	export let selectBoxItem: string[];
	export let selectItem: string;

	const myValue = 'Event';

	if (!selectBoxItem.includes(myValue)) {
		selectBoxItem.push(myValue);
	}

	let input: string;
	async function onClickNaddr() {
		const check = await checkInputNaddr(input);
		if (check.error && check.message) {
			const t = {
				message: check.message,
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
			//		$nowProgress = false;
			return;
		} else if (check.tag) {
			res.tag = check.tag;
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
		<span class="dot" /><span class="px-1 font-bold">Naddr</span>
	</article>
	<!-- Enable for debugging: -->
	<div class="p-2">
		<input
			bind:this={inputElement}
			class="input p-2"
			type="text"
			bind:value={input}
			placeholder="nostr:naddr... or naddr..."
		/>
	</div>
	<footer class=" gap-2 flex flex-wrap justify-end mt-2">
		<PublicButton
			handleClickPub={() => {
				res.btn = 'pub';
				onClickNaddr();
			}}
			{parent}
		/>
		<PrivateButton
			handleClickPrv={() => {
				res.btn = 'prv';
				onClickNaddr();
			}}
			{parent}
		/>
	</footer>
{/if}
