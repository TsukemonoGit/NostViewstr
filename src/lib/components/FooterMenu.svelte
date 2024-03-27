<script lang="ts">
	import { _ } from 'svelte-i18n';
	import {
		MultiMenu,
		allView,
		backButton,
		isMulti,
		nowProgress,
		pubkey_viewer
	} from '$lib/stores/settings';
	import { nip19, type Event as NostrEvent } from 'nostr-tools';
	import Setting from '@material-design-icons/svg/round/settings.svg?raw';
	import firstIcon from '@material-design-icons/svg/round/first_page.svg?raw';
	import lastIcon from '@material-design-icons/svg/round/last_page.svg?raw';
	import backIcon from '@material-design-icons/svg/round/chevron_left.svg?raw';
	import nextIcon from '@material-design-icons/svg/round/chevron_right.svg?raw';
	import multiIcon from '@material-design-icons/svg/round/checklist_rtl.svg?raw';
	import menuIcon from '@material-design-icons/svg/round/menu.svg?raw';
	import LeftIcon from '@material-design-icons/svg/round/west.svg?raw';
	import HomeIcon from '@material-design-icons/svg/round/home.svg?raw';
	import swap from '@material-design-icons/svg/round/swap_vert.svg?raw';
	import ModalTagList from '$lib/components/modals/ModalTagList.svelte';
	import ModalInfo from '$lib/components/modals/ModalInfo.svelte';
	import { amount, listSize, pageNum } from '$lib/stores/pagination';
	import ModalEditTag from './modals/ModalEditTag.svelte';
	import ModalDelete from './modals/ModalDelete.svelte';
	import ModalPostNote from './modals/ModalPostNote.svelte';
	import ModalEventJson from './modals/ModalEventJson.svelte';
	import {
		eventListsMap,
		checkedIndexList,
		listNum,
		type Identifiers,
		keysArray,
		identifierKeysArray,
		identifierListsMap
	} from '$lib/stores/bookmarkEvents';
	import {
		ProgressRadial,
		type ModalComponent,
		type ModalSettings,
		type ToastSettings
	} from '@skeletonlabs/skeleton';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { publishEventWithTimeout } from '$lib/streamEventLists';
	import { relaySet } from '$lib/stores/relays';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';

	export let pubkey: string;
	export let kind: number;
	export let naddr: boolean = false;
	export let bkm: string;
	//$: console.log(
	//	`${$amount * $pageNum} - ${Math.min(($pageNum + 1) * $amount, $listSize)}`
	//);
	const dispatch = createEventDispatcher();
	$: last = $listSize === 0 ? 0 : Math.floor(($listSize - 1) / $amount);
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
		if ($eventListsMap) {
			//console.log(Object.keys(pubkey).some((k) => Number(k) === kind));
			const modal: ModalSettings = {
				type: 'component',
				component: tagListModalComponent,
				title: $_('modal.tagList.title'),
				body: ``,
				value: {
					tagList: $identifierKeysArray,
					pubkey: pubkey,
					kind: kind
				},
				response: (res) => {
					console.log(res);
					if (res) {
						if (res.edit === true) {
							editTagModalOpen();
						} else if (
							res.index !== -1 &&
							$eventListsMap !== undefined &&
							$eventListsMap[pubkey] &&
							$eventListsMap[pubkey][kind].size > 1
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

			value: { selectedValue: 0, kind: kind, pubkey: pubkey },
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
									tag: $identifierListsMap[pubkey][kind].get(
										$identifierKeysArray[res.tagIndex]
									)?.identifier
								},
								response: async (res2) => {
									//console.log(res);
									if (res2) {
										await deleteTag(res.tagIndex, res.kind5);
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
		description?: string;
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
		if (value.description && value.description.trim() !== '') {
			tags.push(['description', value.description]);
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
		const res = await publishEventWithTimeout(
			event,
			$relaySet[$pubkey_viewer].bookmarkRelays
		); // = { isSuccess: false, msg: '' }; //
		console.log(res.msg);

		if (res.isSuccess) {
			const t = {
				message: res.msg as string, //.join('<br>'),
				timeout: 3000
			};

			toastStore.trigger(t);

			const tmp = get(eventListsMap);
			if (res.event !== undefined) {
				if (tmp && tmp[pubkey] && tmp[pubkey][kind]) {
					tmp[pubkey][kind].set(value.id, res.event);
					eventListsMap.set(tmp);
				} else {
					eventListsMap.set({
						[pubkey]: { [kind]: new Map([[value.id, res.event]]) }
					});
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

	async function deleteTag(tagIndex: number, kind5: boolean) {
		console.log(tagIndex);
		$nowProgress = true;
		const bkm = get(eventListsMap)[pubkey][kind];
		const dtag = bkm
			.get($keysArray[tagIndex])
			?.tags.find((item) => item[0] === 'd');
		const event: NostrEvent = kind5
			? {
					id: '',
					pubkey: pubkey,
					sig: '',
					content: '',
					tags: [['e', bkm.get($keysArray[tagIndex])!.id]],
					created_at: Math.floor(Date.now() / 1000),
					kind: 5
			  }
			: {
					id: '',
					pubkey: pubkey,
					sig: '',
					content: '',
					tags: dtag ? [dtag] : [],
					created_at: Math.floor(Date.now() / 1000),
					kind: bkm.get($keysArray[tagIndex])!.kind
			  };
		const res = await publishEventWithTimeout(
			event,
			$relaySet[$pubkey_viewer].bookmarkRelays
		);
		console.log(res.msg);

		if (res.isSuccess) {
			const t = {
				message: res.msg as string, //.join('<br>'),
				timeout: 3000
			};

			toastStore.trigger(t);

			//const tmpId = get(identifierListsMap);
			if (kind5) {
				$eventListsMap[pubkey][kind].delete($keysArray[tagIndex]); //削除
				$identifierListsMap[pubkey][kind].delete($keysArray[tagIndex]); //IDListも
				$identifierKeysArray =
					$identifierListsMap[pubkey] && $identifierListsMap[pubkey][kind]
						? Array.from($identifierListsMap[pubkey][kind].keys()).sort(
								(a, b) => a.localeCompare(b)
						  )
						: [];
				$keysArray =
					$eventListsMap[pubkey] && $eventListsMap[pubkey][kind]
						? Array.from($eventListsMap[pubkey][kind].keys()).sort((a, b) =>
								a.localeCompare(b)
						  )
						: [];
			}
			//IDリストも更新
			//tmpId[pubkey][kind].splice(tagIndex, 1); //削除
			//	identifierList.set(tmpId);
		} else {
			const t = {
				message: res.msg,
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};
			toastStore.trigger(t);
		}
		if ($listNum >= $eventListsMap[pubkey][kind].size) {
			$listNum = $eventListsMap[pubkey][kind].size - 1;
		}
		$nowProgress = false;
		console.log(res);
		//	throw new Error('Function not implemented.');
	}
	//-----------------------------------------------引用ポスト
	const postNoteModalComponent: ModalComponent = {
		ref: ModalPostNote
	};

	//-------------------------------イベントJSON表示
	const jsonModalComponent: ModalComponent = {
		ref: ModalEventJson
	};
	//-------------------------------------------------------information
	const infoComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalInfo
	};

	function onClickInfo() {
		const modal: ModalSettings = {
			type: 'component',
			component: infoComponent,
			title: $_('modal.info.title'),
			value: {
				pubkey: pubkey,
				relaySet: $relaySet[pubkey]
			},
			response: (res: {
				share: boolean;
				shareNaddr: boolean;
				openJson: boolean;
				openMyJson: boolean;
				goto: boolean;
				selectValue: string;
			}) => {
				if (res) {
					if (res.share || res.shareNaddr) {
						const address: nip19.AddressPointer = {
							identifier:
								$identifierListsMap?.[pubkey]?.[kind].get(
									$identifierKeysArray[$listNum]
								)?.identifier ?? '',
							pubkey: pubkey,
							kind: kind,
							relays: $relaySet[pubkey]?.bookmarkRelays
						};

						const url = res.share
							? window.location.href
							: window.location.origin + '/' + nip19.naddrEncode(address);
						const tags = res.share
							? [['r', url]]
							: ['a', `${kind}:${pubkey}:${address.identifier}`, ['r', url]];
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
					} else if (res.openJson) {
						const modal = {
							type: 'component' as const,
							title: 'Event Json',
							backdropClasses: '!bg-surface-400/80',
							meta: {
								note: $relaySet[pubkey].relayEvent
							},

							component: jsonModalComponent
						};
						modalStore.trigger(modal);
					} else if (res.openMyJson) {
						const modal = {
							type: 'component' as const,
							title: 'Event Json',
							backdropClasses: '!bg-surface-400/80',
							meta: {
								note: $relaySet[$pubkey_viewer].relayEvent
							},

							component: jsonModalComponent
						};
						modalStore.trigger(modal);
					} else if (res.goto) {
						bkm = 'pub';
						goto(`/${nip19.npubEncode($pubkey_viewer)}/${res.selectValue}`);
					}
				}
			}
		};

		modalStore.trigger(modal);
	}
	let multiButtonClass: string = '';
	function onClickMulti() {
		if ($isMulti === MultiMenu.Sort) {
			dispatch('SortReset');
		}
		$isMulti += 1;
		if ($isMulti >= Object.keys(MultiMenu).length / 2) {
			$isMulti = 0;
		}
		console.log($isMulti);
	}
	$: {
		multiButtonClass =
			$isMulti === MultiMenu.Multi
				? 'variant-ghost-secondary rounded-full '
				: $isMulti === MultiMenu.Sort
				? 'variant-ghost-warning rounded-full'
				: '';
		$checkedIndexList = [];
	}
	export let disabled: boolean = false;

	function handleBackClick() {
		// ここでも history.back() を防ぐ条件を確認
		//if (isBackEnabled) {
		history.back();
		modalStore.close();
		//	}
	}
</script>

<div
	class=" fixed bottom-0 z-10 w-full inline-flex flex-row space-x-0 overflow-x-hidden h-10"
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
			{#if $backButton}
				<button
					class="btn-icon variant-filled-primary fill-white"
					disabled={!(history.length > 1)}
					on:click={handleBackClick}>{@html LeftIcon}</button
				>
			{/if}
			<!-- <button
				class="btn-icon variant-filled-surface fill-white"
				disabled={!(history.length > 1)}
				on:mousedown={handleBackLongPressStart}
				on:mouseup={() => {
					clearTimeout(timer);
				}}
				on:mouseleave={() => {
					clearTimeout(timer);
				}}
				on:touchstart={handleBackLongPressStart}
				on:touchend={() => {
					clearTimeout(timer);
				}}
				on:click={handleBackClick}>{@html LeftIcon}</button
			> -->

			{#if !naddr}
				<button
					class={buttonClass}
					on:click={openLists}
					disabled={!(kind >= 30000 && kind < 40000) || disabled}
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
				disabled={pubkey !== $pubkey_viewer || disabled}
				on:click={onClickMulti}
				>{@html $isMulti === MultiMenu.Sort ? swap : multiIcon}</button
			>

			<!-- <button class={buttonClass}>{@html updateIcon}</button> -->

			<button class={buttonClass} on:click={onClickInfo}>{@html Setting}</button
			>
			<!-- <button
				class="btn-icon variant-filled-surface pageIcon"
				on:click={() => {
					goto('/');
					modalStore.close();
				}}>{@html HomeIcon}</button
			> -->
		{/if}
	</div>
</div>

<style>
	:global(.pageIcon svg) {
		width: 2em;
		height: 2em;
		fill: white;
	}
</style>
