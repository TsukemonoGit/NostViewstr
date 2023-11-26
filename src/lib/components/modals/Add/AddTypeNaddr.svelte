<script lang="ts">
	import { checkInputNoteOrNaddr } from '$lib/nostrFunctions';
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';
	enum AddTyle {
		Id = 'id',
		Tag = 'tag'
	}
	export let res: { btn: string; tag: string[] };
	export let parent: any;
	export let onFormSubmit: any;
	let input: string;
	async function onClickCheck() {
		const check = await checkInputNoteOrNaddr(input);
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

<article class="body">
	{$_('modal.addNote_body')}
</article>
<!-- Enable for debugging: -->

<input
	class="input p-2 m-2"
	type="text"
	bind:value={input}
	placeholder="note..."
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
