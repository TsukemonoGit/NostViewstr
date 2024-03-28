<script lang="ts">
	import { _ } from 'svelte-i18n';
	import EventCard from '$lib/components/EventCard.svelte';
	import { MenuMode, ogpDescription } from '$lib/otherFunctions.js';

	import { Metadata, NostrApp, Text, UniqueEventList } from 'nosvelte';
	import { nip19, type Event as NostrEvent } from 'nostr-tools';
	import { getIdByTag, nip04De, parseNaddr } from '$lib/nostrFunctions';
	import SearchCard from './SearchCard.svelte';

	import { amount, pageNum, listSize } from '$lib/stores/pagination';
	import { MultiMenu, isMulti } from '$lib/stores/settings';
	import MenuButtons from './MenuButtons.svelte';
	//import MenuButtons2 from './MenuButtons2.svelte';
	import EditIcon from '@material-design-icons/svg/round/edit_note.svg?raw';
	import ProfileCard from './ProfileCard.svelte';
	import Emoji from './Emoji.svelte';

	import { createEventDispatcher } from 'svelte';
	import Relay from './Relay.svelte';
	import Other from './Other.svelte';
	import Reference from '$lib/components/Reference.svelte';
	import Hashtag from './Hashtag.svelte';
	import OGP from './OGP.svelte';
	import { kinds } from '$lib/kind';

	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';

	const flipDurationMs = 0;

	export let DeleteNote: (e: CustomEvent<any>) => void;
	export let MoveNote: (e: CustomEvent<any>) => void;
	export let CheckNote: (e: CustomEvent<any>) => void;

	export let listEvent: NostrEvent | undefined;
	export let bkm = 'pub'; //'pub'|'prv'
	export let isOwner: boolean;
	export let noEdit: boolean = false;
	export let pubkey: string;
	export let isNaddr: boolean;

	console.log(bkm);
	//let viewList: string[][];
	//一つのタグに一種類のイベントしかないことにして日付だけ見る
	const uniqueEvent = (eventList: NostrEvent[]): NostrEvent => {
		//console.log(eventList);
		eventList.sort((a, b) => b.created_at - a.created_at);
		return eventList[0];
	};
	const privateList = async (list: NostrEvent) => {
		if (list.content !== '') {
			//	try {
			const decypt = await nip04De(list.pubkey, list.content);
			return JSON.parse(decypt);
			//		} catch (error) {
			//			console.error('復号失敗');

			//		return [];
			//	}
		} else {
			console.log('プライベートブクマなんもないよ');
			return [];
		}
	};
	//export let size: number = 0;
	//export let pageNum = 0;
	//export let amount = 50;
	export let viewList: string[][] = [];

	$: if (bkm !== 'prv' && listEvent) {
		viewUpdate();
	}
	$: if (bkm) {
		viewUpdate();
	} else {
		viewList = [];
		$listSize = 0;
	}
	$: console.log($listSize);
	let message: string;

	export async function viewUpdate() {
		message = '';
		console.log(bkm);
		if (listEvent) {
			if (bkm === 'pub') {
				$listSize = listEvent ? listEvent.tags.length : 0;
				viewList = listEvent ? listEvent.tags : [];
			} else if (isOwner) {
				try {
					const res = await privateList(listEvent);
					$listSize = res.length;
					viewList = res;
				} catch (error) {
					$listSize = 0;
					viewList = [];
					message = listEvent.content;
				}
			} else {
				$listSize = 0;
				viewList = [];
				message = listEvent.content;
			}
		} else {
			$listSize = 0;
			viewList = [];
		}
	}
	//	$: console.log($listSize, $amount, $pageNum);

	$: viewPage = viewList.slice(
		Math.min($pageNum, Math.floor($listSize / $amount)) * $amount,
		($pageNum + 1) * Math.min($amount, $listSize)
	);

	$: menuSearch = noEdit
		? MenuMode.Viewer
		: $isMulti === MultiMenu.Multi
		? MenuMode.Multi
		: $isMulti === MultiMenu.Sort
		? MenuMode.Sort
		: isOwner
		? MenuMode.other
		: MenuMode.none;
	$: menuEvent = noEdit
		? MenuMode.Viewer
		: $isMulti === MultiMenu.Multi
		? MenuMode.Multi
		: $isMulti === MultiMenu.Sort
		? MenuMode.Sort
		: isOwner
		? MenuMode.Owner
		: MenuMode.Viewer;

	const dispatch = createEventDispatcher();
	function handleClick(myIndex: number, tagArray: string[]) {
		dispatch('EditTag', {
			number: myIndex,
			tagArray: tagArray
		});
	}
	let isSortEditing;
	function handleDndConsider(e: {
		detail: { items: { id: number; name: string[] }[] };
	}) {
		items = e.detail.items;
	}
	function handleDndFinalize(e: {
		detail: { items: { id: number; name: string[] }[] };
	}) {
		console.log(e.detail.items);
		items = e.detail.items;
		if (items !== items_original) {
			isSortEditing = true;
		} else {
			isSortEditing = false;
		}
	}

	// Convert emojiData to the desired format
	$: items_original = viewPage?.map((item, index) => {
		return {
			id: index,
			name: item
		};
	});
	$: items = items_original;

	export function resetItems(): void {
		items = items_original;
	}
	export function getSortedTags(): string[][] {
		const sorted = [...viewList];
		console.log(sorted);
		const sortedPage = items.map((item, index) => {
			return item.name;
		});

		const startIndex = $pageNum * $amount;
		const endIndex = Math.min(startIndex + $amount, sorted.length);
		console.log($pageNum, startIndex, endIndex);
		sorted.splice(startIndex, endIndex - startIndex, ...sortedPage);

		return sorted;
	}
	//スマホだとスクロールのドラッグとかぶるから…
	$: dadClass = $isMulti === MultiMenu.Sort ? 'md:mr-0 mr-6 ' : '';
</script>

{#if viewPage && viewPage.length > 0}
	<section
		use:dndzone={{
			items,
			flipDurationMs,

			dragDisabled: $isMulti === MultiMenu.Sort ? false : true
		}}
		on:consider={handleDndConsider}
		on:finalize={handleDndFinalize}
		class={dadClass}
		on:touchmove|nonpassive={(e) => {
			console.log(e);
			$isMulti === MultiMenu.Sort ? e.preventDefault() : '';
		}}
	>
		{#each items as tag (tag.id)}
			<div animate:flip={{ duration: flipDurationMs }}>
				{#await getIdByTag(tag.name)}
					<!--loading a タグ　のなかみ-->
					<div class="z-0 card drop-shadow px-1 py-1 my-0.5">
						{tag.name}
					</div>
				{:then { id, filter, kind }}
					{#if tag.name[0] === 'd' || tag.name[0] === 'title' || tag.name[0] === 'image' || tag.name[0] === 'description'}
						<!--なんもしない-->
					{:else}
						<!-- ノート | ボタン群-->

						{#if tag.name[0] === 'e'}
							<!-- {#if $searchRelays && $searchRelays.length > 0}
					<NostrApp relays={$searchRelays}> -->
							<Text queryKey={[id]} {id} let:text>
								<div
									slot="loading"
									class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
								>
									<SearchCard
										{filter}
										message={`loading [${tag.name}]`}
										isPageOwner={isOwner}
									/>
									<MenuButtons
										{isNaddr}
										kind={listEvent?.kind}
										myIndex={tag.id}
										tagArray={tag.name}
										note={undefined}
										menuMode={menuSearch}
										on:DeleteNote={DeleteNote}
										on:MoveNote={MoveNote}
										on:CheckNote={CheckNote}
									/>
								</div>
								<div
									slot="error"
									class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
								>
									<SearchCard
										{filter}
										message={`error [${tag.name}]`}
										isPageOwner={isOwner}
									/>
									<MenuButtons
										{isNaddr}
										kind={listEvent?.kind}
										myIndex={tag.id}
										tagArray={tag.name}
										note={undefined}
										menuMode={menuSearch}
										on:DeleteNote={DeleteNote}
										on:MoveNote={MoveNote}
										on:CheckNote={CheckNote}
									/>
								</div>
								<div
									slot="nodata"
									class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
								>
									<SearchCard
										{filter}
										message={`not found [${tag.name}]`}
										isPageOwner={isOwner}
									/><MenuButtons
										{isNaddr}
										kind={listEvent?.kind}
										myIndex={tag.id}
										tagArray={tag.name}
										note={undefined}
										menuMode={menuSearch}
										on:DeleteNote={DeleteNote}
										on:MoveNote={MoveNote}
										on:CheckNote={CheckNote}
									/>
								</div>

								<Metadata
									queryKey={['metadata', text.pubkey]}
									pubkey={text.pubkey}
									let:metadata
								>
									<div
										slot="loading"
										class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
									>
										<EventCard
											isPageOwner={isOwner}
											tagArray={tag.name}
											note={text}
											metadata={undefined}
											{pubkey}
										/><MenuButtons
											{isNaddr}
											kind={listEvent?.kind}
											myIndex={tag.id}
											tagArray={tag.name}
											note={text}
											menuMode={menuEvent}
											on:DeleteNote={DeleteNote}
											on:MoveNote={MoveNote}
											on:CheckNote={CheckNote}
										/>
									</div>
									<div
										slot="error"
										class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
									>
										<EventCard
											isPageOwner={isOwner}
											tagArray={tag.name}
											note={text}
											metadata={undefined}
											{pubkey}
										/><MenuButtons
											{isNaddr}
											kind={listEvent?.kind}
											myIndex={tag.id}
											tagArray={tag.name}
											note={text}
											menuMode={menuEvent}
											on:DeleteNote={DeleteNote}
											on:MoveNote={MoveNote}
											on:CheckNote={CheckNote}
										/>
									</div>
									<div
										slot="nodata"
										class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
									>
										<EventCard
											isPageOwner={isOwner}
											tagArray={tag.name}
											note={text}
											metadata={undefined}
											{pubkey}
										/><MenuButtons
											{isNaddr}
											kind={listEvent?.kind}
											myIndex={tag.id}
											tagArray={tag.name}
											note={text}
											menuMode={menuEvent}
											on:DeleteNote={DeleteNote}
											on:MoveNote={MoveNote}
											on:CheckNote={CheckNote}
										/>
									</div>
									<div
										class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
									>
										<EventCard
											isPageOwner={isOwner}
											tagArray={tag.name}
											note={text}
											{metadata}
											{pubkey}
										/>
										<MenuButtons
											{isNaddr}
											kind={listEvent?.kind}
											myIndex={tag.id}
											tagArray={tag.name}
											note={text}
											menuMode={menuEvent}
											on:DeleteNote={DeleteNote}
											on:MoveNote={MoveNote}
											on:CheckNote={CheckNote}
										/>
									</div>
								</Metadata>
							</Text>
						{:else if tag.name[0] === 'a'}
							<!-- {#if $searchRelays && $searchRelays.length > 0}
					<NostrApp relays={$searchRelays}> -->
							<UniqueEventList
								queryKey={tag.name}
								filters={[filter]}
								let:events
							>
								<div
									slot="loading"
									class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
								>
									{#if kind && kind === 30023}<!--long form content-->
										<OGP
											ogp={{
												title: 'Long Form Content',
												image: '',
												description:
													'open in habla' +
													ogpDescription(parseNaddr(tag.name)),
												favicon: 'https://habla.news/favicon.png'
											}}
											url={'https://habla.news/a/\n' +
												nip19.naddrEncode(parseNaddr(tag.name))}
										/>
										<!---->
									{:else if kind && kind === 34550}<!--communities-->
										<OGP
											ogp={{
												title: 'Communities',
												image: '',
												description:
													'open in habla\n' +
													ogpDescription(parseNaddr(tag.name)),
												favicon: 'https://habla.news/favicon.png'
											}}
											url={'https://habla.news/c/' +
												nip19.naddrEncode(parseNaddr(tag.name))}
										/>
									{:else}
										<SearchCard
											{filter}
											message={`loading [${tag.name}]`}
											isPageOwner={isOwner}
										/>
									{/if}
									<MenuButtons
										{isNaddr}
										kind={listEvent?.kind}
										myIndex={tag.id}
										tagArray={tag.name}
										note={undefined}
										menuMode={menuSearch}
										on:DeleteNote={DeleteNote}
										on:MoveNote={MoveNote}
										on:CheckNote={CheckNote}
									/>
								</div>
								<div
									slot="error"
									class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
								>
									{#if kind && kind === 30023}
										<OGP
											ogp={{
												title: 'Long Form Content',
												image: '',
												description:
													'open in habla\n' +
													ogpDescription(parseNaddr(tag.name)),
												favicon: 'https://habla.news/favicon.png'
											}}
											url={'https://habla.news/a/' +
												nip19.naddrEncode(parseNaddr(tag.name))}
										/>
										<!---->
									{:else if kind && kind === 34550}<!--communities-->
										<OGP
											ogp={{
												title: 'Communities',
												image: '',
												description:
													'open in habla\n' +
													ogpDescription(parseNaddr(tag.name)),
												favicon: 'https://habla.news/favicon.png'
											}}
											url={'https://habla.news/c/' +
												nip19.naddrEncode(parseNaddr(tag.name))}
										/>
									{:else}
										<SearchCard
											{filter}
											message={`error [${tag.name}]`}
											isPageOwner={isOwner}
										/>
									{/if}
									<MenuButtons
										{isNaddr}
										kind={listEvent?.kind}
										myIndex={tag.id}
										tagArray={tag.name}
										note={undefined}
										menuMode={menuSearch}
										on:DeleteNote={DeleteNote}
										on:MoveNote={MoveNote}
										on:CheckNote={CheckNote}
									/>
								</div>
								<div
									slot="nodata"
									class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
								>
									{#if kind && kind === 30023}
										<OGP
											ogp={{
												title: 'Long Form Content',
												image: '',
												description:
													'open in habla\n' +
													ogpDescription(parseNaddr(tag.name)),
												favicon: 'https://habla.news/favicon.png'
											}}
											url={'https://habla.news/a/' +
												nip19.naddrEncode(parseNaddr(tag.name))}
										/>
										<!---->
									{:else if kind && kind === 34550}<!--communities-->
										<OGP
											ogp={{
												title: 'Communities',
												image: '',
												description:
													'open in habla\n' +
													ogpDescription(parseNaddr(tag.name)),
												favicon: 'https://habla.news/favicon.png'
											}}
											url={'https://habla.news/c/' +
												nip19.naddrEncode(parseNaddr(tag.name))}
										/>
									{:else}
										<SearchCard
											{filter}
											message={`not found [${tag.name}]`}
											isPageOwner={isOwner}
										/>
									{/if}
									<MenuButtons
										{isNaddr}
										kind={listEvent?.kind}
										myIndex={tag.id}
										tagArray={tag.name}
										note={undefined}
										menuMode={menuSearch}
										on:DeleteNote={DeleteNote}
										on:MoveNote={MoveNote}
										on:CheckNote={CheckNote}
									/>
								</div>

								<Metadata
									queryKey={['metadata', uniqueEvent(events).pubkey]}
									pubkey={uniqueEvent(events).pubkey}
									let:metadata
								>
									<div
										slot="loading"
										class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
									>
										<EventCard
											isPageOwner={isOwner}
											tagArray={tag.name}
											note={uniqueEvent(events)}
											metadata={undefined}
											{pubkey}
										/>
										<MenuButtons
											{isNaddr}
											kind={listEvent?.kind}
											myIndex={tag.id}
											tagArray={tag.name}
											note={uniqueEvent(events)}
											menuMode={menuEvent}
											on:DeleteNote={DeleteNote}
											on:MoveNote={MoveNote}
											on:CheckNote={CheckNote}
										/>
									</div>
									<div
										slot="error"
										class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
									>
										<EventCard
											isPageOwner={isOwner}
											tagArray={tag.name}
											note={uniqueEvent(events)}
											metadata={undefined}
											{pubkey}
										/><MenuButtons
											{isNaddr}
											kind={listEvent?.kind}
											myIndex={tag.id}
											tagArray={tag.name}
											note={uniqueEvent(events)}
											menuMode={menuEvent}
											on:DeleteNote={DeleteNote}
											on:MoveNote={MoveNote}
											on:CheckNote={CheckNote}
										/>
									</div>
									<div
										slot="nodata"
										class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
									>
										<EventCard
											isPageOwner={isOwner}
											tagArray={tag.name}
											note={uniqueEvent(events)}
											metadata={undefined}
											{pubkey}
										/><MenuButtons
											{isNaddr}
											kind={listEvent?.kind}
											myIndex={tag.id}
											tagArray={tag.name}
											note={uniqueEvent(events)}
											menuMode={menuEvent}
											on:DeleteNote={DeleteNote}
											on:MoveNote={MoveNote}
											on:CheckNote={CheckNote}
										/>
									</div>
									<div
										class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
									>
										<EventCard
											isPageOwner={isOwner}
											tagArray={tag.name}
											note={uniqueEvent(events)}
											{metadata}
											{pubkey}
										/>
										<MenuButtons
											{isNaddr}
											kind={listEvent?.kind}
											myIndex={tag.id}
											tagArray={tag.name}
											note={uniqueEvent(events)}
											menuMode={menuEvent}
											on:DeleteNote={DeleteNote}
											on:MoveNote={MoveNote}
											on:CheckNote={CheckNote}
										/>
									</div>
								</Metadata>
							</UniqueEventList>
						{:else if tag.name[0] === 'p'}
							<Metadata
								queryKey={['metadata', tag.name[1]]}
								pubkey={tag.name[1]}
								let:metadata
							>
								<div
									slot="loading"
									class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1 break-all"
								>
									<SearchCard
										{filter}
										message={`loading [${tag.name}]`}
										isPageOwner={isOwner}
									/>

									<!-- loading ... {JSON.stringify(tag.name)} -->
									<MenuButtons
										{isNaddr}
										kind={listEvent?.kind}
										myIndex={tag.id}
										tagArray={tag.name}
										note={undefined}
										menuMode={menuSearch}
										share={false}
										on:DeleteNote={DeleteNote}
										on:MoveNote={MoveNote}
										on:CheckNote={CheckNote}
									/>
								</div>
								<div
									slot="error"
									class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1 break-all"
								>
									<SearchCard
										{filter}
										message={`not found [${tag.name}]`}
										isPageOwner={isOwner}
									/>
									<MenuButtons
										{isNaddr}
										kind={listEvent?.kind}
										myIndex={tag.id}
										tagArray={tag.name}
										note={undefined}
										menuMode={menuSearch}
										share={false}
										on:DeleteNote={DeleteNote}
										on:MoveNote={MoveNote}
										on:CheckNote={CheckNote}
									/>
								</div>
								<div
									slot="nodata"
									class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1 break-all"
								>
									<SearchCard
										{filter}
										message={`not found [${tag.name}]`}
										isPageOwner={isOwner}
									/>
									<MenuButtons
										{isNaddr}
										kind={listEvent?.kind}
										myIndex={tag.id}
										tagArray={tag.name}
										note={undefined}
										menuMode={menuSearch}
										share={false}
										on:DeleteNote={DeleteNote}
										on:MoveNote={MoveNote}
										on:CheckNote={CheckNote}
									/>
								</div>
								<div
									class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
								>
									<ProfileCard {metadata} tagArray={tag.name} />
									<MenuButtons
										{isNaddr}
										kind={listEvent?.kind}
										myIndex={tag.id}
										tagArray={tag.name}
										note={metadata}
										menuMode={menuEvent}
										share={false}
										on:DeleteNote={DeleteNote}
										on:MoveNote={MoveNote}
										on:CheckNote={CheckNote}
									/>
								</div>
							</Metadata>
						{:else if tag.name[0] === 'emoji'}
							<!--えもじ-->
							<div
								class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1"
							>
								<Emoji tagArray={tag.name} />
								{#if isOwner && !$isMulti}
									<button
										class="btn p-2 fill-surface-600 dark:fill-surface-300"
										on:click={() => {
											handleClick(tag.id, tag.name);
										}}>{@html EditIcon}</button
									>
								{/if}
								<MenuButtons
									{isNaddr}
									kind={listEvent?.kind}
									myIndex={tag.id}
									tagArray={tag.name}
									note={undefined}
									menuMode={noEdit
										? MenuMode.Viewer
										: isOwner
										? $isMulti === MultiMenu.Multi
											? MenuMode.Multi
											: $isMulti === MultiMenu.Sort
											? MenuMode.Sort
											: MenuMode.Owner
										: MenuMode.Viewer}
									on:DeleteNote={DeleteNote}
									on:MoveNote={MoveNote}
									on:CheckNote={CheckNote}
								/>
							</div>
						{:else if (tag.name[0] === 'r' && tag.name.length > 1 && tag.name[1].startsWith('ws')) || tag.name[0] === 'relay'}
							<!--りれー-->
							<div
								class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1 break-all"
							>
								<Relay tagArray={tag.name} />
								{#if isOwner && $isMulti === MultiMenu.None}
									<button
										class="btn p-2 fill-surface-600 dark:fill-surface-300"
										on:click={() => {
											handleClick(tag.id, tag.name);
										}}>{@html EditIcon}</button
									>
								{/if}
								<MenuButtons
									{isNaddr}
									kind={listEvent?.kind}
									myIndex={tag.id}
									tagArray={tag.name}
									share={false}
									note={undefined}
									menuMode={noEdit
										? MenuMode.Viewer
										: isOwner
										? $isMulti === MultiMenu.Multi
											? MenuMode.Multi
											: $isMulti === MultiMenu.Sort
											? MenuMode.Sort
											: MenuMode.Owner
										: MenuMode.none}
									on:DeleteNote={DeleteNote}
									on:MoveNote={MoveNote}
									on:CheckNote={CheckNote}
								/>
							</div>
						{:else if tag.name[0] === 'r'}
							<div
								class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1 break-all"
							>
								<Reference tagArray={tag.name} />
								{#if isOwner && $isMulti === MultiMenu.None}
									<button
										class="btn p-2 fill-surface-600 dark:fill-surface-300"
										on:click={() => {
											handleClick(tag.id, tag.name);
										}}>{@html EditIcon}</button
									>
								{/if}
								<MenuButtons
									{isNaddr}
									kind={listEvent?.kind}
									myIndex={tag.id}
									tagArray={tag.name}
									note={undefined}
									menuMode={noEdit
										? MenuMode.Viewer
										: isOwner
										? $isMulti === MultiMenu.Multi
											? MenuMode.Multi
											: $isMulti === MultiMenu.Sort
											? MenuMode.Sort
											: MenuMode.Owner
										: MenuMode.none}
									on:DeleteNote={DeleteNote}
									on:MoveNote={MoveNote}
									on:CheckNote={CheckNote}
								/>
							</div>
						{:else if tag.name[0] === 't'}
							<!--はっしゅたぐ-->

							<div
								class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1 break-all"
							>
								<Hashtag tagArray={tag.name} />
								{#if isOwner && $isMulti === MultiMenu.None}
									<button
										class="btn p-2 fill-surface-600 dark:fill-surface-300"
										on:click={() => {
											handleClick(tag.id, tag.name);
										}}>{@html EditIcon}</button
									>
								{/if}
								<MenuButtons
									{isNaddr}
									kind={listEvent?.kind}
									myIndex={tag.id}
									tagArray={tag.name}
									note={undefined}
									menuMode={noEdit
										? MenuMode.Viewer
										: isOwner
										? $isMulti === MultiMenu.Multi
											? MenuMode.Multi
											: $isMulti === MultiMenu.Sort
											? MenuMode.Sort
											: MenuMode.Owner
										: MenuMode.none}
									on:DeleteNote={DeleteNote}
									on:MoveNote={MoveNote}
									on:CheckNote={CheckNote}
								/>
							</div>
						{:else if tag.name[0] === 'word'}
							<!--word-->

							<div
								class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1 break-all"
							>
								<Other tagArray={tag.name} />
								{#if isOwner && $isMulti === MultiMenu.None}
									<button
										class="btn p-2 fill-surface-600 dark:fill-surface-300"
										on:click={() => {
											handleClick(tag.id, tag.name);
										}}>{@html EditIcon}</button
									>
								{/if}
								<MenuButtons
									{isNaddr}
									kind={listEvent?.kind}
									myIndex={tag.id}
									tagArray={tag.name}
									note={undefined}
									menuMode={noEdit
										? MenuMode.Viewer
										: isOwner
										? $isMulti === MultiMenu.Multi
											? MenuMode.Multi
											: $isMulti === MultiMenu.Sort
											? MenuMode.Sort
											: MenuMode.Owner
										: MenuMode.none}
									on:DeleteNote={DeleteNote}
									on:MoveNote={MoveNote}
									on:CheckNote={CheckNote}
								/>
							</div>
						{:else}
							<!--a,e,d,emoji,relay,r,t,word以外-->

							<div
								class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1 break-all"
							>
								{JSON.stringify(tag.name)}
								{#if isOwner && $isMulti === MultiMenu.None}
									<button
										class="btn p-2 fill-surface-600 dark:fill-surface-300"
										on:click={() => {
											handleClick(tag.id, tag.name);
										}}>{@html EditIcon}</button
									>
								{/if}
								<MenuButtons
									{isNaddr}
									kind={listEvent?.kind}
									myIndex={tag.id}
									tagArray={tag.name}
									note={undefined}
									menuMode={noEdit
										? MenuMode.Viewer
										: isOwner
										? $isMulti === MultiMenu.Multi
											? MenuMode.Multi
											: $isMulti === MultiMenu.Sort
											? MenuMode.Sort
											: MenuMode.Owner
										: MenuMode.none}
									on:DeleteNote={DeleteNote}
									on:MoveNote={MoveNote}
									on:CheckNote={CheckNote}
								/>
							</div>
						{/if}
					{/if}
				{/await}
			</div>
		{/each}
	</section>
{:else if message}
	<p class="h5 font-bold">【List's content】</p>
	<div class="break-all whitespace-break-spaces">{message}</div>
{/if}
