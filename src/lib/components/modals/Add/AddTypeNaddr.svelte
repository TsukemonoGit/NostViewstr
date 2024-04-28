<script lang="ts">
	import { checkInputNaddr } from '$lib/nostrFunctions';
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { nip19 } from 'nostr-tools';
	import { nowProgress } from '$lib/stores/settings';
	import dotIcon from '@material-design-icons/svg/round/circle.svg?raw';
	export let res: { btn: string; tag: string[] };
	export let parent: any;
	export let onFormSubmit: any;
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
</script>

<!---->
<article class="body">
	<span class="dot" /><span class="px-1 font-bold">Naddr</span>
</article>
<!-- Enable for debugging: -->

<input
	class="input p-2 m-2"
	type="text"
	bind:value={input}
	placeholder="nostr:naddr... or naddr..."
/>

<footer class=" gap-2 flex flex-wrap justify-end mt-2">
	<button
		class="btn variant-filled-warning {parent.buttonPositive}"
		on:click={() => {
			res.btn = 'prv';
			onClickNaddr();
		}}
		disabled={$nowProgress}>Private</button
	>
	<button
		class="btn {parent.buttonPositive}"
		on:click={() => {
			res.btn = 'pub';
			onClickNaddr();
		}}
		disabled={$nowProgress}>Public</button
	>
</footer>

<!---->
