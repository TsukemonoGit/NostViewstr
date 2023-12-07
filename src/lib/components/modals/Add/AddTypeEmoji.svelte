<script lang="ts">
	import { checkInputNpub } from '$lib/nostrFunctions';
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';
	import type { Nostr } from 'nosvelte';

	export let res: { btn: string; tag: string[]; check: boolean };
	export let parent: any;
	export let onFormSubmit: any;
	//export let viewList: string[][];
	export let tag: string[];

	let emojiUrl: string = tag ? tag[2] : '';
	let emojiName: string = tag ? tag[1] : '';

	async function onClickCheck() {
		// event.tags 配列内で条件を満たすインデックスを検索
		if (emojiName === '' || emojiUrl === '') {
			return;
		}

		// const index = viewList.findIndex((tag) => tag[1] === emojiName);
		// if (index !== -1) {
		// 	//同じリストに同じ名前の絵文字があったら無効
		// 	const t = {
		// 		message: $_('toast.invalidEmoji'),
		// 		timeout: 3000,
		// 		background: 'bg-orange-500 text-white width-filled '
		// 	};

		// 	toastStore.trigger(t);
		// 	return;
		// }
		res.tag = ['emoji', emojiName, emojiUrl];
		res.check = true;
		onFormSubmit();
	}
</script>

<!-- Enable for debugging: -->
<article class="body">
	{`emoji`}
</article>
<div
	class="mt-2 input-group input-group-divider grid-rows-[auto_auto_auto_auto]"
>
	<div class="input-group-shim">emoji name</div>
	<input
		class="input p-2 my-2 w-full"
		type="text"
		bind:value={emojiName}
		on:input={() => (emojiName = emojiName.replace(/[^a-zA-Z0-9-_]/g, ''))}
		placeholder="name"
	/>
	<div class="input-group-shim">image url</div>
	<input
		class="input p-2 my-2"
		type="text"
		bind:value={emojiUrl}
		placeholder="https://.....png"
	/>
</div>
<img src={emojiUrl} alt="emojiUrl" width="64px" />

<footer class=" gap-2 flex flex-wrap justify-end mt-2">
	<button
		class="btn {parent.buttonPositive}"
		on:click={() => {
			res.btn = 'pub';
			onClickCheck();
		}}>SAVE</button
	>
</footer>
