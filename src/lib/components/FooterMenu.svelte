<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { allView, nowProgress, settings } from '$lib/stores/settings';
	import Setting from '@material-design-icons/svg/round/settings.svg?raw';
	import firstIcon from '@material-design-icons/svg/round/first_page.svg?raw';
	import lastIcon from '@material-design-icons/svg/round/last_page.svg?raw';
	import backIcon from '@material-design-icons/svg/round/chevron_left.svg?raw';
	import nextIcon from '@material-design-icons/svg/round/chevron_right.svg?raw';
	import menuIcon from '@material-design-icons/svg/round/menu.svg?raw';
	import updateIcon from '@material-design-icons/svg/round/update.svg?raw';
	import ModalTagList from '$lib/components/modals/ModalTagList.svelte';
	import ModalInfo from '$lib/components/modals/ModalInfo.svelte';
	import { amount, listSize, pageNum } from '$lib/stores/pagination';
	import ModalEditTag from './modals/ModalEditTag.svelte';
	import ModalDelete from './modals/ModalDelete.svelte';
	import {
		bookmarkEvents,
		identifierList,
		listNum
	} from '$lib/stores/bookmarkEvents';
	import {
		ProgressRadial,
		type ModalComponent,
		type ModalSettings
	} from '@skeletonlabs/skeleton';
	import { modalStore } from '$lib/stores/store';
	$: console.log(
		`${$amount * $pageNum} - ${Math.min(($pageNum + 1) * $amount, $listSize)}`
	);
	$: last = Math.floor($listSize / $amount);
	function next(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if ($pageNum < Math.floor($listSize / $amount)) {
			$pageNum++;
		}
	}

	function back(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if ($pageNum > 0) {
			$pageNum--;
		}
	}

	function firstPage(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		$pageNum = 0;
	}

	function lastPage(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		$pageNum = last;
	}

	const buttonClass = 'pageIcon btn btn-sm py-0 px-2 fill-white';
	//-----------------------------------------------
	const tagListModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalTagList,
		// Add the component properties as key/value pairs
		props: { background: 'bg-red-500' },
		// Provide a template literal for the default component slot
		slot: `<p>Skeleton</p>`
	};

	function openLists(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if ($bookmarkEvents) {
			const modal: ModalSettings = {
				type: 'component',
				component: tagListModalComponent,
				title: $_('nprofile.modal.tagList.title'),
				body: ``,
				value: {
					tagList: $identifierList
				},
				response: (res) => {
					console.log(res);
					if (res) {
						if (res.edit === true) {
							editTagModalOpen();
						} else if (
							res.index !== -1 &&
							$bookmarkEvents !== undefined &&
							$bookmarkEvents.length > 1
						) {
							$listNum = res.index;
						}
					}
				}
			};
			modalStore.trigger(modal);
		}
	}
	//---------------------------------------------delete?modal
	const deleteModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalDelete,
		// Add the component properties as key/value pairs
		//props: { background: 'bg-red-500' },
		// Provide a template literal for the default component slot
		slot: '<p>Skeleton</p>'
	};
	//-------------------------------------------------------edit tag
	const editTagModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalEditTag,
		// Add the component properties as key/value pairs
		props: { background: 'bg-red-500' },
		// Provide a template literal for the default component slot
		slot: '<p>Skeleton</p>'
	};

	function editTagModalOpen() {
		const modal: ModalSettings = {
			type: 'component',

			// Pass the component directly:
			component: editTagModalComponent,
			// Provide arbitrary metadata to your modal instance:
			title: $_('nprofile.modal.editTags.title'),
			body: $_('nprofile.modal.editTags.body'),
			value: { selectedValue: 0 },
			// Returns the updated response value
			response: (res) => {
				console.log(res);
				if (res) {
					switch (res.btn) {
						case 'add':
							addTag(res.value);

							break;
						case 'delete':
							//
							const modal: ModalSettings = {
								type: 'component',
								component: deleteModalComponent,
								title: $_('nprofile.modal.deleteTag.title'),
								body: `${$_('nprofile.modal.deleteTag.body')}`,
								value: {
									tag: $identifierList[res.tagIndex]
								},
								response: async (res2) => {
									//console.log(res);
									if (res2) {
										await deleteTag(res.tagIndex);
									}
								}
							};
							modalStore.trigger(modal);

							break;
					}
				}
			}
		};
		modalStore.trigger(modal);
	}

	function addTag(value: any) {
		//	throw new Error('Function not implemented.');
	}

	function deleteTag(tagIndex: any) {
		//throw new Error('Function not implemented.');
	}

	//-------------------------------------------------------infomation
	const infoComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalInfo
	};
	const modal: ModalSettings = {
		type: 'component',
		component: infoComponent,
		title: $_('nprofile.modal.info.title'),
		body: `${$_('nprofile.modal.info.body')}`
	};

	function onClickInfo() {
		modalStore.trigger(modal);
	}
</script>

{#if $settings}
	<div class=" fixed bottom-0 z-10 w-screen">
		<div
			class=" inline-flex flex-row space-x-0 overflow-hidden rounded-token; variant-filled-primary w-screen justify-center rounded-none"
		>
			{#if $nowProgress}
				<!----><ProgressRadial class="btn btn-sm " width={'w-14'} stroke={56} />
			{:else}
				<button class={buttonClass} on:click={openLists}
					>{@html menuIcon}</button
				>

				<div class="grid grid-rows-[auto_auto] gap-0">
					<div class="flex">
						<button
							class={buttonClass}
							on:click={firstPage}
							disabled={$pageNum === 0 ? true : false}>{@html firstIcon}</button
						>
						<button
							class={buttonClass}
							on:click={back}
							disabled={$pageNum === 0 ? true : false}>{@html backIcon}</button
						>

						<button
							class={buttonClass}
							on:click={next}
							disabled={$pageNum === last ? true : false}
							>{@html nextIcon}</button
						>
						<button
							class={buttonClass}
							on:click={lastPage}
							disabled={$pageNum === last ? true : false}
							>{@html lastIcon}</button
						>
					</div>
					<div class="flex justify-center items-center m-0 p-0 text-xs">
						{`${$amount * $pageNum} - ${Math.min(
							($pageNum + 1) * $amount,
							$listSize
						)} / ${$listSize}`}
					</div>
				</div>
				<button class={buttonClass}>{@html updateIcon}</button>

				<button class={buttonClass} on:click={onClickInfo}
					>{@html Setting}</button
				>
			{/if}
		</div>
	</div>
{/if}

<style>
	:global(.pageIcon svg) {
		width: 2em;
		height: 2em;
		fill: white;
	}
</style>
