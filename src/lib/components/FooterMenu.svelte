<script lang="ts">
	import { _ } from 'svelte-i18n';
	import {
		allView,
		isMulti,
		nowProgress,
		pubkey_viewer,
		settings
	} from '$lib/stores/settings';
	import type { Event as NostrEvent } from 'nostr-tools';
	import Setting from '@material-design-icons/svg/round/settings.svg?raw';
	import firstIcon from '@material-design-icons/svg/round/first_page.svg?raw';
	import lastIcon from '@material-design-icons/svg/round/last_page.svg?raw';
	import backIcon from '@material-design-icons/svg/round/chevron_left.svg?raw';
	import nextIcon from '@material-design-icons/svg/round/chevron_right.svg?raw';
	import multiIcon from '@material-design-icons/svg/round/checklist_rtl.svg?raw';
	import menuIcon from '@material-design-icons/svg/round/menu.svg?raw';
	import updateIcon from '@material-design-icons/svg/round/update.svg?raw';
	import ModalTagList from '$lib/components/modals/ModalTagList.svelte';
	import ModalInfo from '$lib/components/modals/ModalInfo.svelte';
	import { amount, listSize, pageNum } from '$lib/stores/pagination';
	import ModalEditTag from './modals/ModalEditTag.svelte';
	import ModalDelete from './modals/ModalDelete.svelte';
	import ModalPostNote from './modals/ModalPostNote.svelte';
	import {
		bookmarkEvents,
		checkedIndexList,
		identifierList,
		listNum
	} from '$lib/stores/bookmarkEvents';
	import {
		ProgressRadial,
		type ModalComponent,
		type ModalSettings
	} from '@skeletonlabs/skeleton';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { publishEvent, publishEventWithTimeout } from '$lib/nostrFunctions';
	import { bookmarkRelays } from '$lib/stores/relays';
	import { get } from 'svelte/store';
	import type { Event } from 'nostr-tools';
	export let pubkey: string;
	export let kind: number;
	export let naddr: boolean = false;
	$: console.log(
		`${$amount * $pageNum} - ${Math.min(($pageNum + 1) * $amount, $listSize)}`
	);
	$: last = Math.floor(($listSize - 1) / $amount);
	function next() {
		if ($pageNum < Math.floor(($listSize - 1) / $amount)) {
			$pageNum++;
		}
	}

	function back() {
		if ($pageNum > 0) {
			$pageNum--;
		}
	}

	function firstPage() {
		$pageNum = 0;
	}

	function lastPage() {
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

	function openLists() {
		if ($bookmarkEvents) {
			const modal: ModalSettings = {
				type: 'component',
				component: tagListModalComponent,
				title: $_('modal.tagList.title'),
				body: ``,
				value: {
					tagList: $identifierList,
					pubkey: pubkey
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
			title: $_('modal.editTags.title'),

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
								title: $_('modal.deleteTag.title'),
								body: `${$_('modal.deleteTag.body')}`,
								value: {
									tag: $identifierList[res.tagIndex].identifier
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

	async function addTag(value: {
		id: string;
		title?: string;
		image?: string;
		summary?: string;
	}) {
		$nowProgress = true;
		console.log(value);

		let tags = [['d', value.id]];
		if (value.title && value.title.trim() !== '') {
			tags.push(['title', value.title]);
		}
		if (value.image && value.image.trim() !== '') {
			tags.push(['image', value.image]);
		}
		if (value.summary && value.summary.trim() !== '') {
			tags.push(['summary', value.summary]);
		}
		console.log(tags);
		const event: NostrEvent = {
			id: '',
			pubkey: pubkey,
			sig: '',
			content: '',
			tags: tags,
			created_at: Math.floor(Date.now() / 1000),
			kind: kind
		};
		const res = await publishEventWithTimeout(event, $bookmarkRelays); // = { isSuccess: false, msg: '' }; //
		console.log(res.msg);

		if (res.isSuccess) {
			const t = {
				message: res.msg as string, //.join('<br>'),
				timeout: 3000
			};

			toastStore.trigger(t);

			const tmp = get(bookmarkEvents);
			if (res.event !== undefined) {
				if (tmp !== undefined) {
					tmp.push(res.event);
					bookmarkEvents.set(tmp);
				} else {
					bookmarkEvents.set([res.event]);
				}
			}
		} else {
			const t = {
				message: res.msg,
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};
			toastStore.trigger(t);
		}
		$nowProgress = false;
		console.log(res);
		//	throw new Error('Function not implemented.');
	}

	async function deleteTag(tagIndex: any) {
		console.log(tagIndex);
		$nowProgress = true;
		const bkm = get(bookmarkEvents) as Event[];

		const event: NostrEvent = {
			id: '',
			pubkey: pubkey,
			sig: '',
			content: '',
			tags: [['e', bkm[tagIndex].id]],
			created_at: Math.floor(Date.now() / 1000),
			kind: 5
		};
		const res = await publishEventWithTimeout(event, $bookmarkRelays);
		console.log(res.msg);

		if (res.isSuccess) {
			const t = {
				message: res.msg as string, //.join('<br>'),
				timeout: 3000
			};

			toastStore.trigger(t);

			const tmp = get(bookmarkEvents);

			if (tmp !== undefined) {
				tmp.splice(tagIndex, 1); //削除
				bookmarkEvents.set(tmp);
			} else {
				//ないことはないと思う
				console.log('えらー');
			}
		} else {
			const t = {
				message: res.msg,
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};
			toastStore.trigger(t);
		}
		$nowProgress = false;
		console.log(res);
		//	throw new Error('Function not implemented.');
	}
	//-----------------------------------------------引用ポスト
	const postNoteModalComponent: ModalComponent = {
		ref: ModalPostNote
	};
	//-------------------------------------------------------infomation
	const infoComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalInfo
	};
	const modal: ModalSettings = {
		type: 'component',
		component: infoComponent,
		title: $_('modal.info.title'),
		body: `${$_('modal.info.body')}`,
		response: (res) => {
			if (res && res.share) {
				const url = window.location.href;
				const tags = [['r', url]];
				console.log(tags);
				const modal: ModalSettings = {
					type: 'component',
					component: postNoteModalComponent,
					title: $_('modal.postNote.title'),
					body: ``,
					value: {
						content: `\r\n${url}\r\n`,
						tags: tags
					},
					response: async (res) => {
						console.log(res);
						//postNoteまでmodalでやるらしい
					}
				};
				modalStore.trigger(modal);
			}
		}
	};

	function onClickInfo() {
		modalStore.trigger(modal);
	}

	let multiButtonClass: string = '';
	function onClickMulti() {
		$isMulti = !$isMulti;
	}
	$: {
		multiButtonClass = $isMulti ? 'variant-ghost-secondary rounded-full ' : '';
		$checkedIndexList = [];
	}
</script>

{#if $settings}
	<div
		class=" fixed bottom-0 z-10 w-full inline-flex flex-row space-x-0 overflow-x-hidden"
	>
		<div
			class="container max-w-[1024px] mx-auto flex overflow-hidden rounded-token; variant-filled-primary justify-center rounded-none sm:gap-5 gap-0"
		>
			{#if $nowProgress}
				<!----><ProgressRadial
					class="btn btn-sm "
					meter="stroke-primary-300"
					track="stroke-primary-300/30"
					width={'w-14'}
					stroke={60}
				/>
			{:else}
				{#if !naddr}
					<button class={buttonClass} on:click={openLists}
						>{@html menuIcon}</button
					>
				{/if}

				<!-- <div class="grid grid-rows-[auto_auto] gap-0"> -->
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
						disabled={$pageNum === last ? true : false}>{@html nextIcon}</button
					>
					<button
						class={buttonClass}
						on:click={lastPage}
						disabled={$pageNum === last ? true : false}>{@html lastIcon}</button
					>
				</div>
				<!-- <div class="flex justify-center items-center m-0 p-0 text-xs">
						{`${$amount * $pageNum} - ${Math.min(
							($pageNum + 1) * $amount,
							$listSize
						)} / ${$listSize}`}
					</div>
				</div> -->

				<button
					class="btn btn-icon pageIcon {multiButtonClass}"
					disabled={pubkey !== $pubkey_viewer}
					on:click={onClickMulti}>{@html multiIcon}</button
				>

				<!-- <button class={buttonClass}>{@html updateIcon}</button> -->

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
