<script lang="ts">
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { Modal, Toast, getModalStore } from '@skeletonlabs/skeleton';

	import ModalEventJson from '$lib/components/modals/ModalEventJson.svelte';

	import searchIcon from '@material-design-icons/svg/round/search.svg?raw';
	import Search from '$lib/components/Search.svelte';

	import { _ } from 'svelte-i18n';
	import type { QueryKey } from '@tanstack/svelte-query';

	export let isPageOwner: boolean;
	export let filter: {};
	export let message: string;
	export let textSize: string = '';
	export let queryKey: QueryKey;

	//export let menuMode: MenuMode;

	//export let tagArray: string[] | undefined;

	const modalStore = getModalStore();

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
			title: $_('modal.search.title'),
			body: ``,
			value: {
				filter: filter,
				isPageOwner: isPageOwner,
				queryKey: queryKey
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

<!-- icon | その他-->
<div class=" grid grid-cols-[auto_1fr] gap-1.5">
	<!--icon-->

	<div class="flex justify-center items-center h-auto">
		<button
			class="fill-white btn m-0 p-1 variant-filled-secondary rounded-full"
			on:click={() => {
				onClickSearch(filter);
			}}>{@html searchIcon}</button
		>
	</div>
	<!--note-->
	<div class="break-all whitespace-pre-wrap overflow-x-hidden {textSize}">
		{message}
	</div>
</div>
