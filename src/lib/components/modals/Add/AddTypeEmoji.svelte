<script lang="ts">
	import { _ } from 'svelte-i18n';

	import PublicButton from './PublicButton.svelte';

	export let res: { btn: string; tag: string[]; check: boolean };
	export let parent: any;
	export let onFormSubmit: any;
	//export let viewList: string[][];
	export let tag: string[];

	export let selectBoxItem: string[];
	export let selectItem: string;

	const myValue = 'Emoji';

	if (!selectBoxItem.includes(myValue)) {
		selectBoxItem.push(myValue);
	}

	let emojiUrl: string = tag ? tag[2] : '';
	let emojiName: string = tag ? tag[1] : '';

	async function onClickCheck() {
		// event.tags 配列内で条件を満たすインデックスを検索
		if (emojiName === '' || emojiUrl === '') {
			return;
		}

		res.tag = ['emoji', emojiName.trim(), emojiUrl.trim()];
		res.check = true;
		onFormSubmit();
	}

	let inputElement: HTMLInputElement;
	$: if (selectItem === myValue && inputElement) {
		inputElement.focus();
	}
</script>

{#if selectItem === myValue}
	<article class="body">
		<span class="dot" /><span class="px-1 font-bold">Emoji</span>
	</article>
	<div
		class="mt-2 input-group input-group-divider grid-rows-[auto_auto_auto_auto]"
	>
		<div class="input-group-shim">
			emoji name (only alphanumeric characters and underscores)
		</div>
		<input
			bind:this={inputElement}
			class="input p-2 my-2 w-full"
			type="text"
			bind:value={emojiName}
			on:input={() => (emojiName = emojiName.replace(/[^a-zA-Z0-9_]/g, ''))}
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
	<img loading="lazy" src={emojiUrl} alt="emojiUrl" width="64px" />

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
