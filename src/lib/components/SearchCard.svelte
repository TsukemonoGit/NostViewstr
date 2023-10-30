<script lang="ts">
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { Modal, Toast, getModalStore } from '@skeletonlabs/skeleton';
	import ModalProfile from '$lib/components/modals/ModalProfile.svelte';
	import ModalEventJson from '$lib/components/modals/ModalEventJson.svelte';

	import searchIcon from '@material-design-icons/svg/round/search.svg?raw';
	import Search from '$lib/components/Search.svelte';
	import { createEventDispatcher } from 'svelte';

	import { _ } from 'svelte-i18n';
	import type { MenuMode } from '$lib/functions';

	import MenuButtons from './MenuButtons.svelte';
	export let DeleteNote: (e: CustomEvent<any>) => void;
	export let MoveNote: (e: CustomEvent<any>) => void;
	export let CheckNote: (e: CustomEvent<any>) => void;
	export let isPageOwner: boolean;
	export let filter: {};
	export let message: string;

	export let menuMode: MenuMode;
	export let myIndex: number | undefined;
	export let tagArray: string[] | undefined;
	const dispatch = createEventDispatcher();

	const modalStore = getModalStore();

	enum State {
		Default,
		Delete,
		Move,
		Check
	}

	type NostrProfile = {
		name: string;
		display_name: string;
		picture: string;
	};

	//-------------------------------イベントJSON表示
	const jsonModalComponent: ModalComponent = {
		ref: ModalEventJson
	};

	const OpenNoteJson = (tag: string[]) => {
		const modal = {
			type: 'component' as const,
			title: 'Event Json',
			backdropClasses: '!bg-surface-400/80',
			meta: {
				//note: text,
				tagArray: tag
			},

			component: jsonModalComponent
		};
		modalStore.trigger(modal);
	};

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

	//-----------------------------------------------サーチ
	const searchModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: Search,
		// Add the component properties as key/value pairs
		props: { background: 'bg-red-500' },
		// Provide a template literal for the default component slot
		slot: `<p>Skeleton</p>`
	};
	function onClickSearch(filter: {}) {
		//  console.log('search');

		const modal: ModalSettings = {
			type: 'component',
			component: searchModalComponent,
			title: $_('nprofile.modal.search.title'),
			body: ``,
			value: {
				filter: filter,
				isPageOwner: isPageOwner
			},
			response: async (res) => {
				//  console.log(res);
				if (res) {
				}
			}
		};
		modalStore.trigger(modal);
	}
</script>

<!--{#if $searchRelays}-->
<!-- <NostrApp relays={$searchRelays}> -->
<!-- ノート | ボタン群-->
<div class="card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1">
	<!-- icon | その他-->
	<div class="grid grid-cols-[auto_1fr] gap-1.5">
		<!--icon-->

		<div class="flex justify-center items-center h-auto">
			<button
				class="btn m-0 p-1 variant-filled-secondary rounded-full"
				on:click={() => {
					onClickSearch(filter);
				}}>{@html searchIcon}</button
			>
		</div>
		<!--note-->
		<div class="break-all whitespace-pre-wrap overflow-x-hidden">
			{message}
		</div>
	</div>

	<!--ボタン群-->
	<MenuButtons
		{myIndex}
		{tagArray}
		note={undefined}
		{menuMode}
		on:DeleteNote={DeleteNote}
		on:MoveNote={MoveNote}
		on:CheckNote={CheckNote}
	/>
</div>
