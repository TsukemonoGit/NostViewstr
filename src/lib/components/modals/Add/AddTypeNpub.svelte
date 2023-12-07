<script lang="ts">
	import { checkInputNpub } from '$lib/nostrFunctions';
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';

	export let res: { btn: string; tag: string[] };
	export let parent: any;
	export let onFormSubmit: any;
	export let viewList: string[][]; //今見てるリスト（pub,prvもく別）重複チェック

	let input: string;

	async function onClickCheck() {
		//有効かチェック
		const check = await checkInputNpub(input);
		if (check.error && check.message) {
			const t = {
				message: check.message,
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
			//		$nowProgress = false;
			return;
		}

		//重複チェック
		const index = viewList.findIndex((tag) => tag[1] === check.tag?.[1]);
		if (index !== -1) {
			const t = {
				message: $_('toast.invalidEmoji'),
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
			return;
		}

		if (check.tag) {
			res.tag = check.tag;
			onFormSubmit();
		}
	}
</script>

<article class="body">
	{`nostr:npub1... or npub1... or nprofile...`}
</article>
<!-- Enable for debugging: -->

<input
	class="input p-2 m-2"
	type="text"
	bind:value={input}
	placeholder="npub..."
/>

<footer class=" gap-2 flex flex-wrap justify-end mt-2">
	<button
		class="btn variant-filled-warning {parent.buttonPositive}"
		on:click={() => {
			res.btn = 'prv';
			onClickCheck();
		}}>Private</button
	>
	<button
		class="btn {parent.buttonPositive}"
		on:click={() => {
			res.btn = 'pub';
			onClickCheck();
		}}>Public</button
	>
</footer>
