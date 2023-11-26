<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';
	// Props
	/** Exposes parent props to this component. */
	export let parent: any;

	// Stores
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import AddTypeNoteAndNaddr from './Add/AddTypeNoteAndNaddr.svelte';
	import {
		isOneDimensionalArray,
		publishEventWithTimeout
	} from '$lib/nostrFunctions';
	import { kindsValidTag } from '$lib/kind';
	import type { Nostr } from 'nosvelte';
	import { relaySet } from '$lib/stores/relays';
	import AddTypeNpub from './Add/AddTypeNpub.svelte';
	import AddTypeNote from './Add/AddTypeNote.svelte';
	import AddTypeNaddr from './Add/AddTypeNaddr.svelte';
	import AddTypeEmoji from './Add/AddTypeEmoji.svelte';

	let input: string;
	let content: string;
	// Form Data
	const res: { btn: string; tag: string[] } = {
		btn: 'pub',
		tag: []
		// value: '',
		// btn: 'pub',
		// create: false,
		// type: AddTyle.Id,
		// tagvalue: ''
	};
	// "a" と "e" が両方含まれているか確認
	const includesA = kindsValidTag[$modalStore[0].value.kind].includes('a');
	const includesE = kindsValidTag[$modalStore[0].value.kind].includes('e');
	const includesP = kindsValidTag[$modalStore[0].value.kind].includes('p');
	const includesEmoji =
		kindsValidTag[$modalStore[0].value.kind].includes('emoji');
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

	function onTagkara() {
		try {
			const tagArray = JSON.parse(input);
			if (!isOneDimensionalArray(tagArray)) {
				throw new Error();
			}

			//validtagかちぇっく
			if (
				$modalStore[0].value.kind ||
				!tagArray ||
				!kindsValidTag[$modalStore[0].value.kind].includes(tagArray[0])
			) {
				throw new Error();
			}
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
		console.log($relaySet[$modalStore[0].value.pubkey].postRelays);
		if ($relaySet[$modalStore[0].value.pubkey].postRelays.length > 0) {
			const response = await publishEventWithTimeout(
				event,
				$relaySet[$modalStore[0].value.pubkey].postRelays
			);
			if (response.isSuccess) {
				const t = {
					message: response.msg,
					timeout: 3000
				};

				toastStore.trigger(t);

				if (response.event) {
					res.tag = ['e', response.event.id]; //追加するノートIDがこれ
					onFormSubmit();
				} else {
					const t = {
						message: 'failed to publish',
						timeout: 3000,
						background: 'bg-orange-500 text-white width-filled '
					};
					toastStore.trigger(t);
					//		$nowProgress = false;
					return;
				}
			}
		}
	}
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<Accordion autocollapse>
			<AccordionItem open>
				<svelte:fragment slot="lead">🗒</svelte:fragment>
				<svelte:fragment slot="summary"
					>{$_('ModalAddNote.add_note')}</svelte:fragment
				>
				<svelte:fragment slot="content">
					<div class="card p-4">
						<header class={cHeader}>
							🗒 {$_('ModalAddNote.add_note_to1')}{$modalStore[0].title ??
								'(title missing)'}{$_('ModalAddNote.add_note_to2')}
						</header>
						{#if includesA && includesE}
							<AddTypeNoteAndNaddr {res} {parent} {onFormSubmit} />
						{:else if includesE}
							<AddTypeNote {res} {parent} {onFormSubmit} />
						{:else if includesA}
							<AddTypeNaddr {res} {parent} {onFormSubmit} />
						{/if}
						{#if includesP}
							<AddTypeNpub {res} {parent} {onFormSubmit} />{/if}
						{#if includesEmoji}
							<AddTypeEmoji
								{res}
								{parent}
								{onFormSubmit}
								event={$modalStore[0].value.event}
							/>
						{/if}
						<!-- <AddTypeNote/>
						<AddTypeNpub/>
						<AddTypeNaddr /> -->

						<!-- <article class="body">
							{$_('modal.addNote_body')}
						</article>
						

						<input
							class="input p-2 m-2"
							type="text"
							bind:value={res.value}
							placeholder="note..."
						/>

						<footer class=" gap-2 flex flex-wrap justify-end mt-2">
							<button
								class="btn variant-filled-warning {parent.buttonPositive}"
								on:click={() => {
									res.type = AddTyle.Id;
									res.btn = 'prv';
									onFormSubmit();
								}}>Private</button
							>
							<button
								class="btn {parent.buttonPositive}"
								on:click={() => {
									res.type = AddTyle.Id;
									res.btn = 'pub';
									onFormSubmit();
								}}>Public</button
							>
						</footer> -->
					</div>
				</svelte:fragment>
			</AccordionItem>

			<AccordionItem>
				<svelte:fragment slot="lead">🗒</svelte:fragment>
				<svelte:fragment slot="summary"
					>{$_('ModalAddNote.add_note')}
					{$_('ModalAddNote.add_note_tag')}</svelte:fragment
				>
				<svelte:fragment slot="content">
					<div class="card p-4">
						<header class={cHeader}>
							🗒 {$_('ModalAddNote.add_note_to1')}{$modalStore[0].title ??
								'(title missing)'}{$_('ModalAddNote.add_note_to2')}
							{$_('ModalAddNote.add_note_tag')}
						</header>
						<article class="body break-all">
							<!-- {$_('ModalAddNote.example')}1 ["emoji" ,"wayo",
							"https://example.com/example.png"]<br />
							{$_('ModalAddNote.example')}2 [ "a",
							"30030:84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5:mono"
							]<br /> -->
							valid tag:
							{#each kindsValidTag[$modalStore[0].value.kind] as tag, index}
								{tag},
							{/each}
							<!-- <span class="text-warning-500"
								>{$_('ModalAddNote.caution')}
							</span> -->
						</article>
						<!-- Enable for debugging: -->

						<input
							class="input p-2 m-2"
							type="text"
							bind:value={input}
							placeholder="[”e”,”1234”]"
						/>

						<footer class=" rid grid-cols-3 gap-2 flex justify-end mt-2">
							<button
								class="btn variant-filled-warning {parent.buttonPositive}"
								on:click={() => {
									res.btn = 'prv';
									onTagkara();
									//onFormSubmit();
								}}>Private</button
							>
							<button
								class="btn {parent.buttonPositive}"
								on:click={() => {
									res.btn = 'pub';
									onTagkara();
									//onFormSubmit();
								}}>Public</button
							>
						</footer>
					</div>
				</svelte:fragment>
			</AccordionItem>
			{#if $modalStore[0].value.kind === 30003 || $modalStore[0].value.kind === 10003}
				<AccordionItem>
					<svelte:fragment slot="lead">🖊</svelte:fragment>
					<svelte:fragment slot="summary"
						>{$_('ModalAddNote.create')}
					</svelte:fragment>
					<svelte:fragment slot="content">
						<div class="card p-4">
							<header class={cHeader}>
								🖊 {$_('ModalAddNote.create_to1')}{$modalStore[0].title ??
									'(title missing)'}{$_('ModalAddNote.create_to2')}
							</header>
							<article class="body">{$_('ModalAddNote.create_body')}</article>
							<!-- Enable for debugging: -->

							<textarea
								class="textarea p-2 m-2"
								rows="4"
								bind:value={content}
								placeholder="memo..."
							/>

							<footer class=" rid grid-cols-3 gap-2 flex justify-end mt-2">
								<button
									class="btn variant-filled-warning {parent.buttonPositive}"
									on:click={() => {
										if (content == '') {
											return;
										}
										res.btn = 'prv';
										onClickCreate();
									}}>Private</button
								>
								<button
									class="btn {parent.buttonPositive}"
									on:click={() => {
										if (content == '') {
											return;
										}
										res.btn = 'pub';
										onClickCreate();
									}}>Public</button
								>
							</footer>
						</div>
					</svelte:fragment>
				</AccordionItem>
			{/if}
		</Accordion>
		<footer class=" flex justify-end mt-2 mr-5">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>
				{parent.buttonTextCancel}
			</button>
		</footer>
	</div>
{/if}
