<script lang="ts">
	import { checkInputNpub } from '$lib/nostrFunctions';
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';
	import PrivateButton from './PrivateButton.svelte';
	import PublicButton from './PublicButton.svelte';
	import { nip19 } from 'nostr-tools';

	export let res: { btn: string; tag: string[]; check: boolean };
	export let parent: any;
	export let onFormSubmit: any;
	export let tag: string[]; //編集の場合はここに初期値が
	export let selectBoxItem: string[];
	export let selectItem: string;

	const myValue = 'User';

	if (!selectBoxItem.includes(myValue)) {
		selectBoxItem.push(myValue);
	}

	//export let viewList: string[][]; //今見てるリスト（pub,prvもく別）重複チェック
	const setPub = (): string => {
		if (tag && tag.length > 1 && tag[1]) {
			try {
				return nip19.npubEncode(tag[1]);
			} catch (error) {
				return '';
			}
		} else return '';
	};
	let input1: string = setPub();
	let input2: string = tag && tag.length > 2 && tag[2] ? tag[2] : '';
	let input3: string = tag && tag.length > 3 && tag[3] ? tag[3] : '';

	async function onClickCheck() {
		//有効かチェック
		const check = await checkInputNpub(input1); //ここで["p",pub]になる
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
		if (check.tag) {
			if (input2 === '' && input3 === '') {
				res.tag = check.tag;
			} else if (input3 === '') {
				res.tag = [...check.tag, input2];
			} else {
				res.tag = [...check.tag, input2, input3];
			}
			res.check = true;
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
		<span class="dot" /><span class="px-1 font-bold">User</span>
	</article>
	<!-- Enable for debugging: -->
	<div class="p-2">
		<label class="my-1"
			>{$_('kind3.npub')}
			<input
				bind:this={inputElement}
				class="input p-2"
				type="text"
				bind:value={input1}
				placeholder="nostr:npub... or npub... or nprofile..."
			/></label
		><label class="my-1"
			>{$_('kind3.relay')} (option)<input
				class="input p-2"
				type="text"
				bind:value={input2}
				placeholder="wss://..."
			/></label
		><label class="my-1"
			>{$_('kind3.petname')} (option)<input
				class="input p-2"
				type="text"
				bind:value={input3}
				placeholder="bob"
			/></label
		>
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
