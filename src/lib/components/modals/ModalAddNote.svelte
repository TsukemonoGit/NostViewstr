<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';

	import {
		Accordion,
		AccordionItem,
		Tab,
		TabGroup
	} from '@skeletonlabs/skeleton';
	import AddTypeNoteAndNaddr from './Add/AddTypeNoteAndNaddr.svelte';
	import { isOneDimensionalArray } from '$lib/nostrFunctions';
	import { publishEventWithTimeout } from '$lib/streamEventLists';
	import { kindsValidTag, uniqueArray } from '$lib/kind';

	import type Nostr from 'nostr-typedef';
	import { relaySet } from '$lib/stores/relays';
	import AddTypeNpub from './Add/AddTypeNpub.svelte';
	import AddTypeNote from './Add/AddTypeNote.svelte';
	import AddTypeNaddr from './Add/AddTypeNaddr.svelte';
	import AddTypeEmoji from './Add/AddTypeEmoji.svelte';
	import AddTypeRelay from './Add/AddTypeRelay.svelte';
	import AddType10002 from './Add/AddType10002.svelte';
	import AddTypeRandTandWord from './Add/AddTypeRandTandWord.svelte';
	import AddTypeAddressPointer from './Add/AddTypeAddressPointer.svelte';
	import EditTypeOther from './Add/EditTypeOther.svelte';
	import { nowProgress } from '$lib/stores/settings';
	import AddTypeRefelence from './Add/AddTypeRefelence.svelte';

	export let parent: any;

	let input: string = $modalStore[0]?.value?.tag
		? JSON.stringify($modalStore[0]?.value?.tag)
		: '';
	let content: string = '';
	// Form Data
	const res: { btn: string; tag: string[]; check: boolean } = {
		btn: 'pub',
		tag: [],
		check: false
		// value: '',
		// btn: 'pub',
		// create: false,
		// type: AddTyle.Id,
		// tagvalue: ''
	};

	//これがundifinedじゃなかったら編集として
	let tag: string[] | undefined = $modalStore[0]?.value?.tag;
	let kind: number = $modalStore[0]?.value?.kind;
	//編集は今開いてる方に追加することになるから開いたときのpubかprvかをチェック
	let bkm: string | undefined = $modalStore[0]?.value?.bkm;
	// "a" と "e" が両方含まれているか確認
	const includesA = kindsValidTag[$modalStore[0].value.kind]?.includes('a');
	const includesE = kindsValidTag[$modalStore[0].value.kind]?.includes('e');
	const includesP = kindsValidTag[$modalStore[0].value.kind]?.includes('p');
	const includesRelay =
		kindsValidTag[$modalStore[0].value.kind]?.includes('relay');
	const includesEmoji =
		kindsValidTag[$modalStore[0].value.kind]?.includes('emoji');
	const includesRefelence =
		kindsValidTag[$modalStore[0].value.kind]?.includes('r');
	const includesT = kindsValidTag[$modalStore[0].value.kind]?.includes('t');
	const includesW = kindsValidTag[$modalStore[0].value.kind]?.includes('word');
	// const charactersToCheck = ['t', 'word'];
	// let countCharacters = kindsValidTag[$modalStore[0].value.kind]?.filter(
	// 	(tag) => charactersToCheck.some((char) => tag.includes(char))
	// );
	// console.log(countCharacters);
	// if (countCharacters === undefined && $modalStore[0].value.tag) {
	// 	countCharacters = [$modalStore[0].value.tag[0]];
	// }
	// console.log(countCharacters);
	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit(): void {
		console.log(res);
		if ($modalStore[0].response) $modalStore[0].response(res);
		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	//const cForm =
	//  'border border-surface-500 p-4 space-y-4 rounded-container-token';

	//たぐからのチェックが
	//リレーの場合同じリレーURLがあるかのチェックとかしてないからだめかも
	//要検討
	function onTagkara() {
		try {
			const tagArray: string[] = JSON.parse(input);
			if (!isOneDimensionalArray(tagArray)) {
				throw new Error();
			}

			//validtagかちぇっく
			if (
				!tagArray ||
				!kindsValidTag[$modalStore[0].value.kind]?.includes(tagArray[0]) ||
				tagArray.length <= 1 ||
				tagArray[1] === ''
			) {
				throw new Error();
			}
			res.tag = tagArray;
			//タグが大丈夫そうだったら

			onFormSubmit();
		} catch (error) {
			const t = {
				message: $_('toast.invalidtag'),
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
			return;
		}
	}

	async function onClickCreate() {
		$nowProgress = true;
		//contentのなかみをkind1に書き込みしてたぐにして返す
		const event: Nostr.Event<any> = {
			id: '',
			pubkey: $modalStore[0].value.pubkey,
			created_at: Math.floor(Date.now() / 1000),
			kind: 1,
			tags: [],
			content: content,
			sig: ''
		};
		console.log($relaySet[$modalStore[0].value.pubkey].writeRelays);
		if ($relaySet[$modalStore[0].value.pubkey].writeRelays.length > 0) {
			const response = await publishEventWithTimeout(
				event,
				$relaySet[$modalStore[0].value.pubkey].writeRelays
			);
			if (response.isSuccess) {
				const t = {
					message: response.msg,
					timeout: 3000
				};

				toastStore.trigger(t);

				if (response.event) {
					res.tag = ['e', response.event.id]; //追加するノートIDがこれ
					$nowProgress = false;
					onFormSubmit();
				} else {
					const t = {
						message: 'failed to publish',
						timeout: 3000,
						background: 'bg-orange-500 text-white width-filled '
					};
					toastStore.trigger(t);
					$nowProgress = false;
					//		$nowProgress = false;
					return;
				}
			}
		}
	}

	let selectBoxItem: string[] = [];
	let selectItem: string;
	$: if (selectBoxItem.length > 0 && !selectItem) {
		selectItem = selectBoxItem[0];
	}
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase} max-h-[90vh] overflow-y-auto">
		<!-- {#if $modalStore[0].value.type === 'add'}{$_('ModalAddNote.add_note')}
		{:else}
		
			{$_('modal.addNote.edit')}
		{/if} -->

		<div class="p-4">
			<header class={cHeader}>
				{#if $modalStore[0].value.type === 'add'}
					🗒 {$_('ModalAddNote.add_note_to1')}{$modalStore[0].title ??
						'(title missing)'}{$_('ModalAddNote.add_note_to2')}
				{:else}
					{$_('modal.addNote.edit')}
				{/if}

				<!-- <select class="select" bind:value={selectItem}>
					{#each selectBoxItem as item}
						<option value={item}>{item}</option>
					{/each}
				</select> -->
			</header>
			<TabGroup
				border="border-b border-surface-400-500-token"
				active="border-b-2 border-surface-900-50-token"
				><div class="max-w-full overflow-x-auto flex">
					{#each selectBoxItem as item}<Tab
							class=""
							bind:group={selectItem}
							name="tab1"
							value={item}
						>
							<span>{item}</span>
						</Tab>{/each}
				</div>
				<svelte:fragment slot="panel">
					{#if $modalStore[0].value.kind === 10002}
						<!--<hr class="!border-dashed my-1" />-->
						<AddType10002
							{res}
							{parent}
							{onFormSubmit}
							tag={$modalStore[0].value.tag}
							bind:selectBoxItem
							bind:selectItem
						/>
					{/if}
					{#if (tag === undefined && includesA && includesE) || (tag !== undefined && (tag[0] === 'a' || tag[0] === 'e'))}
						<!--<hr class="!border-dashed my-1" />-->
						<AddTypeNoteAndNaddr
							{res}
							{parent}
							{onFormSubmit}
							bind:selectBoxItem
							bind:selectItem
						/>
					{:else if (tag === undefined && includesE) || (tag !== undefined && tag[0] === 'e')}
						<!--<hr class="!border-dashed my-1" />-->
						<AddTypeNote
							{res}
							{parent}
							{onFormSubmit}
							bind:selectBoxItem
							bind:selectItem
						/>
					{:else if (tag === undefined && includesA) || (tag !== undefined && tag[0] === 'a')}
						<!--<hr class="!border-dashed my-1" />-->
						<AddTypeNaddr
							{res}
							{parent}
							{onFormSubmit}
							bind:selectBoxItem
							bind:selectItem
						/>
					{/if}

					{#if (tag === undefined && includesP) || (tag !== undefined && tag[0] === 'p')}
						<!--<hr class="!border-dashed my-1" />-->
						<AddTypeNpub
							{res}
							{parent}
							{onFormSubmit}
							bind:selectBoxItem
							bind:selectItem
						/>{/if}
					{#if (tag === undefined && includesEmoji) || (tag !== undefined && tag[0] === 'emoji')}
						<!--<hr class="!border-dashed my-1" />-->
						<AddTypeEmoji
							{res}
							{parent}
							{onFormSubmit}
							tag={$modalStore[0].value.tag}
							bind:selectBoxItem
							bind:selectItem
						/>
					{/if}
					{#if (tag === undefined && includesRelay) || (tag !== undefined && tag[0] === 'relay')}
						<!--<hr class="!border-dashed my-1" />-->
						<AddTypeRelay
							{res}
							{parent}
							{onFormSubmit}
							tag={$modalStore[0].value.tag}
							number={$modalStore[0].value.number}
							viewList={$modalStore[0].value.viewList}
							bind:selectBoxItem
							bind:selectItem
						/>
					{/if}
					<!-- {#if (tag === undefined && countCharacters?.length > 0) || (tag !== undefined && (tag[0] === 't' || tag[0] === 'word'))}
						
						<AddTypeRandTandWord
							{res}
							{parent}
							{onFormSubmit}
							tag={$modalStore[0].value.tag}
							{countCharacters}
							{bkm}
							bind:selectBoxItem
							bind:selectItem
						/>
					{/if} -->
					{#if (tag === undefined && includesT) || (tag !== undefined && tag[0] === 't')}
						<AddTypeRandTandWord
							{res}
							{parent}
							{onFormSubmit}
							tag={$modalStore[0].value.tag}
							tagKind={'t'}
							{bkm}
							bind:selectBoxItem
							bind:selectItem
						/>
					{/if}
					{#if (tag === undefined && includesW) || (tag !== undefined && tag[0] === 'word')}
						<AddTypeRandTandWord
							{res}
							{parent}
							{onFormSubmit}
							tag={$modalStore[0].value.tag}
							tagKind={'word'}
							{bkm}
							bind:selectBoxItem
							bind:selectItem
						/>
					{/if}
					{#if $modalStore[0].value.kind !== 10002 && (includesRefelence || (tag !== undefined && tag[0] === 'r'))}
						<!--<hr class="!border-dashed my-1" />-->
						<AddTypeRefelence
							{res}
							{parent}
							{onFormSubmit}
							tag={$modalStore[0].value.tag}
							{bkm}
							bind:selectBoxItem
							bind:selectItem
						/>
					{/if}
					<!--編集であり知らんタグのとき（タグの中身だけ変更可にする）-->
					{#if tag !== undefined && !uniqueArray().includes(tag[0])}
						<!--<hr class="!border-dashed my-1" />-->
						<EditTypeOther
							{res}
							{parent}
							{onFormSubmit}
							{tag}
							{bkm}
							bind:selectBoxItem
							bind:selectItem
						/>
					{/if}
					{#if tag === undefined && includesA}
						<!--<hr class="!border-dashed my-1" />-->
						<AddTypeAddressPointer
							{res}
							{parent}
							{onFormSubmit}
							{kind}
							bind:selectBoxItem
							bind:selectItem
						/>
					{/if}
				</svelte:fragment></TabGroup
			>
		</div>
	</div>
{/if}
