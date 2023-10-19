<script lang="ts">
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { Modal, Toast, getModalStore } from '@skeletonlabs/skeleton';
	import ModalProfile from '$lib/components/ModalProfile.svelte';
	import ModalEventJson from '$lib/components/ModalEventJson.svelte';
	import DeleteBtn from '$lib/components/Button/DeleteBtn.svelte';
	import Move from '$lib/components/Button/Move.svelte';
	import Share from '$lib/components/Button/Share.svelte';
	import Open from '$lib/components/Button/Open.svelte';
	import { createEventDispatcher } from 'svelte';
	import { nip19 } from 'nostr-tools';
	import { parseNaddr } from '$lib/Functions';

	export let note: NostrEvent;
	export let metadata: NostrEvent | undefined;
	export let iconView: boolean = true;
	export let myIndex: number | undefined;
	export let tagArray: string[] | undefined;
	const dispatch = createEventDispatcher();

	let metadataContent: NostrProfile;
	const modalStore = getModalStore();

	enum State {
		Default,
		Delete,
		Move,
		Check
	}
	type NostrEvent = {
		id: string;
		kind: number;
		pubkey: string;
		content: string;
		sig: string;
		tags: string[][];
		created_at: number;
	};

	type NostrProfile = {
		name: string;
		display_name: string;
		picture: string;
	};

	$: if (metadata) {
		console.log(metadata);
		try {
			metadataContent = JSON.parse(metadata.content);
			console.log(metadataContent);
		} catch (error) {
			console.log('profile Json parse error');
		}
	}

	//-------------------------------プロフィール表示
	const profileModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalProfile
	};

	function OpenProfile(metadata: NostrEvent) {
		const modal: ModalSettings = {
			type: 'component',
			//  flyX: x,
			//  flyY: y,
			meta: {
				//    position: `x-${clientX} y-${clientY}`,

				metadata: metadata
			},
			component: profileModalComponent
		};
		console.log(modal);
		modalStore.trigger(modal);
	}

	//-------------------------------イベントJSON表示
	const jsonModalComponent: ModalComponent = {
		ref: ModalEventJson
	};

	function OpenNoteJson(text: NostrEvent) {
		const modal = {
			type: 'component' as const,
			//  flyX: x,
			//  flyY: y,
			title: 'Event Json',
			meta: {
				//    position: `x-${clientX} y-${clientY}`,
				note: text
			},

			component: jsonModalComponent
		};
		modalStore.trigger(modal);
	}

	function handleClick(state: State) {
		switch (state) {
			case State.Delete:
				dispatch('DeleteNote', { number: myIndex });
				break;

			case State.Move:
				dispatch('MoveNote', { number: myIndex });
				break;
			case State.Check:
				dispatch('CheckNote', { number: myIndex });
				break;
		}
	}
</script>

<Modal />
<Toast />
<!-- ノート | ボタン群-->
<div class="card drop-shadow px-1 py-2 my-1 grid grid-cols-[1fr_auto] gap-1">
	<!-- icon | その他-->
	<div class="grid grid-cols-[auto_1fr] gap-1">
		<!--icon-->
		{#if iconView && metadata}
			<div
				class="w-12 h-12 rounded-full flex justify-center overflow-hidden bg-surface-500/25 mt-1"
			>
				{#if JSON.parse(metadata.content).picture}
					<img
						class="w-12 object-contain justify-center"
						src={JSON.parse(metadata.content).picture}
						alt="avatar"
					/>
				{/if}
			</div>
		{:else}
			<div />
		{/if}

		<!-- profile | note -->
		<div class="grid grid-rows-[auto_1fr] gap-0.5 w-full">
			<!--profile-->
			{#if metadata}
				<!-- name | display_name | time -->
				<div class="w-full grid grid-cols-[auto_1fr_auto] gap-1 h-fix">
					<!--name-->
					<div class="truncate wid justify-items-end">
						<button
							class="text-secondary-600 dark:text-blue-500"
							on:click={() => {
								if (metadata !== undefined) {
									OpenProfile(metadata);
								}
							}}
							><u
								>{#if JSON.parse(metadata.content).name !== ''}{JSON.parse(metadata.content).name}
								{:else}
									<!-- {nip19
                  .npubEncode(note.pubkey)
                  .slice(0, 12)}:{nip19
                  .npubEncode(note.pubkey)
                  .slice(-4)} -->
								{/if}
							</u></button
						>
					</div>
					<!--display_name-->
					<div class="text-left self-end text-sm h-fix wi truncate justify-items-end">
						{#if JSON.parse(metadata.content).display_name}
							{JSON.parse(metadata.content).display_name}
						{/if}
					</div>
					<!--time-->
					<div class="min-w-max">
						<button
							class="text-sm underline decoration-secondary-500"
							on:click={() => {
								OpenNoteJson(note);
							}}>{new Date(note.created_at * 1000).toLocaleString()}</button
						>
					</div>
				</div>
			{:else}
				<div>{note.pubkey}</div>
			{/if}
			<!--note-->
			<div class="parent-container break-all whitespace-pre-wrap">
				{note.content}
			</div>
		</div>
	</div>

	<!--ボタン群-->
	<div>
		<button
			class="btn variant-filled m-0 p-0"
			on:click={() => {
				handleClick(State.Delete);
			}}><DeleteBtn isSmph={false} /></button
		>
		<button on:click={() => handleClick(State.Move)}><Move isSmph={false} /></button>
		
		<!-- <button class="btn variant-filled m-0 p-0" on:click={() => handleClick(State.Check)}
			>Check</button
		> -->
		<button class="btn variant-filled m-0 p-0"><Share isSmph={false} /></button>
		<button
			class="btn variant-filled m-0 p-0"
			on:click={() => {
				if (tagArray) {
					window.open(
						// //nostr.bandはaタグでの検索ができない
						// `https://nostr.band/?q=${
						//   tagArray[0] === 'a'
						//     ? nip19.naddrEncode(parseNaddr(tagArray))
						//     : nip19.noteEncode(tagArray[1])
						// }`,
						`https://nostr.band/?q=${note.id}`,
						'_blank'
					);
				}
			}}><Open isSmph={false} /></button
		>
	</div>
</div>
