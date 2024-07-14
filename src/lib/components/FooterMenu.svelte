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
	import multiIcon from '@material-design-icons/svg/round/done_all.svg?raw';
	import menuIcon from '@material-design-icons/svg/round/menu.svg?raw';
	import LeftIcon from '@material-design-icons/svg/round/west.svg?raw';
	import HomeIcon from '@material-design-icons/svg/round/home.svg?raw';
	import swap from '@material-design-icons/svg/round/swap_vert.svg?raw';
	import checkIcon from '@material-design-icons/svg/outlined/toc.svg?raw';
	import multiMenuIcon from '@material-design-icons/svg/round/checklist_rtl.svg?raw';
	import ModalTagList from '$lib/components/modals/ModalTagList.svelte';
	import ModalInfo from '$lib/components/modals/ModalInfo.svelte';
	import { amount, listSize, pageNum } from '$lib/stores/pagination';
	import ModalEditTag from './modals/ModalEditTag.svelte';
	import ModalDelete from './modals/ModalDelete.svelte';
	import ModalPostNote from './modals/ModalPostNote.svelte';
	import ModalEventJson from './modals/ModalEventJson.svelte';
	import ModalFeedback from './modals/ModalFeedback.svelte';
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
		ListBox,
		ListBoxItem,
		ProgressRadial,
		popup,
		type ModalComponent,
		type ModalSettings,
		type PopupSettings,
		type ToastSettings
	} from '@skeletonlabs/skeleton';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { publishEventWithTimeout } from '$lib/streamEventLists';
	import { relaySet } from '$lib/stores/relays';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import FormatListBulleted from '@material-design-icons/svg/round/format_list_bulleted.svg?raw';
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

	const feedbackModalComponent: ModalComponent = {
		ref: ModalFeedback,
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
			$relaySet[$pubkey_viewer].writeRelays
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
			$relaySet[$pubkey_viewer].writeRelays
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
				shareNpub_kind_d: boolean;
				openJson: boolean;
				openMyJson: boolean;
				goto: boolean;
				selectValue: string;
				feedback: boolean;
			}) => {
				if (res) {
					if (res.share || res.shareNaddr || res.shareNpub_kind_d) {
						const address: nip19.AddressPointer = {
							identifier:
								$identifierListsMap?.[pubkey]?.[kind].get(
									$identifierKeysArray[$listNum]
								)?.identifier ?? '',
							pubkey: pubkey,
							kind: kind,
							relays: $relaySet[pubkey]?.mergeRelays
						};

						const url = res.share
							? window.location.href
							: res.shareNaddr
								? window.location.origin + '/' + nip19.naddrEncode(address)
								: window.location.origin +
									'/' +
									nip19.npubEncode(pubkey) +
									'/' +
									kind +
									'/' +
									encodeURIComponent(
										$identifierListsMap?.[pubkey]?.[kind].get(
											$identifierKeysArray[$listNum]
										)?.identifier ?? ''
									);
						const tags = res.share
							? [['r', url]]
							: [
									['a', `${kind}:${pubkey}:${address.identifier}`],
									['r', url]
								];
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
					} else if (res.feedback) {
						const modal = {
							type: 'component' as const,
							title: 'Send Feedback',
							component: feedbackModalComponent
						};
						modalStore.trigger(modal);
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
	const multimenuValueSet = ['normal', 'multi', 'sort'];
	let multimenuValue: string = multimenuValueSet[0];
	const popupMultiMenu: PopupSettings = {
		event: 'click',
		target: 'popupMultiMenu',
		placement: 'top',
		closeQuery: '.listbox-item',
		state: (test) => {
			console.log(test);

			if (test.state) {
				multimenuValue = multimenuValueSet[$isMulti];
			}
		}
	};
</script>

<div class=" fixed">
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
						>{@html FormatListBulleted}</button
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
				<!--ボタン押したときに説明的なやつをとーすとてきなやつでそれかポップアップメニューでやる-->
				<!-- <button
				class="btn btn-icon pageIcon {multiButtonClass}"
				disabled={pubkey !== $pubkey_viewer || disabled}
				on:click={onClickMulti}
				>{@html $isMulti === MultiMenu.Sort ? swap : multiIcon}</button
			> -->
				<button
					class="btn btn-icon pageIcon"
					disabled={pubkey !== $pubkey_viewer || disabled}
					use:popup={popupMultiMenu}>{@html multiMenuIcon}</button
				>
				<!-- {#if multimenuValue === 'multiIcon'}{@html multiIcon}{:else if multimenuValue === 'swap'}{@html swap}{:else}{@html checkIcon}{/if} -->
				<!-- <button class={buttonClass}>{@html updateIcon}</button> -->

				<button class={buttonClass} on:click={onClickInfo}
					><div class="relative inline-block">
						<span
							class="badge-icon-custom {$pubkey_viewer
								? 'text-success-500'
								: 'text-warning-500'} absolute -top-0.5 -right-0.5 z-10"
							>{#if !$pubkey_viewer}<svg
									xmlns="http://www.w3.org/2000/svg"
									width="1em"
									height="1em"
									viewBox="0 0 24 24"
									><path
										fill="currentColor"
										d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0 0q-3.35 0-5.675-2.325T4 12t2.325-5.675T12 4t5.675 2.325T20 12t-2.325 5.675T12 20"
									/></svg
								>
								<!-- {:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="32"
									height="32"
									viewBox="0 0 24 24"
									><path
										fill="currentColor"
										d="m10.6 16.6l7.05-7.05l-1.4-1.4l-5.65 5.65l-2.85-2.85l-1.4 1.4zM12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"
									/></svg
								> -->
							{/if}</span
						>{@html Setting}
					</div></button
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

	<div
		class="absolute card w-48 shadow-xl py-2 border border-primary-400-500-token"
		data-popup="popupMultiMenu"
	>
		<ListBox active="variant-filled-primary" rounded="rounded-full" class="p-1">
			<ListBoxItem
				name="medium"
				value={multimenuValueSet[0]}
				bind:group={multimenuValue}
				class={multimenuValue === multimenuValueSet[0]
					? 'dark:fill-black fill-white'
					: 'dark:fill-white fill-black'}
				on:click={() => {
					//atodekaku
					$isMulti = MultiMenu.None;
				}}
				><svelte:fragment slot="lead">{@html checkIcon}</svelte:fragment
				>Normal</ListBoxItem
			>
			<ListBoxItem
				value={multimenuValueSet[1]}
				bind:group={multimenuValue}
				name="medium"
				on:click={() => {
					$isMulti = MultiMenu.Multi;
				}}
				class={multimenuValue === multimenuValueSet[1]
					? 'dark:fill-black fill-white'
					: 'dark:fill-white fill-black'}
				><svelte:fragment slot="lead">{@html multiIcon}</svelte:fragment>Multi
				Select Mode
			</ListBoxItem>
			<ListBoxItem
				name="medium"
				value={multimenuValueSet[2]}
				class={multimenuValue === multimenuValueSet[2]
					? 'dark:fill-black fill-white'
					: 'dark:fill-white fill-black'}
				bind:group={multimenuValue}
				on:click={() => {
					dispatch('SortReset');
					$isMulti = MultiMenu.Sort;
				}}
				><svelte:fragment slot="lead">{@html swap}</svelte:fragment>Sort Mode</ListBoxItem
			>
		</ListBox>
		<div class="arrow bg-primary-400-500-token" />
		<!-- <div class="arrow bg-surface-100-800-token border" /> -->
	</div>
</div>

<style>
	:global(.pageIcon svg) {
		width: 2em;
		height: 2em;
		fill: white;
	}

	.badge-icon-custom {
		display: flex;
		height: 0.8rem /* 20px */;
		width: 0.8rem /* 20px */;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		font-size: 0.75rem /* 12px */;
		line-height: 1rem /* 16px */;
		font-weight: 600;
		--tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
		--tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color),
			0 1px 2px -1px var(--tw-shadow-color);
		box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
			var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
	}
</style>
