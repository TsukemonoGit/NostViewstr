<script lang="ts">
	import { _ } from 'svelte-i18n';
	import EventCard from '$lib/components/EventCard.svelte';
	import { MenuMode } from '$lib/otherFunctions.js';

	import { Metadata, NostrApp, Text, UniqueEventList } from 'nosvelte';
	import type { Event as NostrEvent } from 'nostr-tools';
	import { getIdByTag, nip04De } from '$lib/nostrFunctions';
	import SearchCard from './SearchCard.svelte';

	import { amount, pageNum, listSize } from '$lib/stores/pagination';
	import { isMulti } from '$lib/stores/settings';
	import MenuButtons from './MenuButtons.svelte';
	//import MenuButtons2 from './MenuButtons2.svelte';
	import EditIcon from '@material-design-icons/svg/round/edit_note.svg?raw';
	import ProfileCard from './ProfileCard.svelte';
	import Emoji from './Emoji.svelte';

	import { createEventDispatcher } from 'svelte';
	import Relay from './Relay.svelte';
	export let DeleteNote: (e: CustomEvent<any>) => void;
	export let MoveNote: (e: CustomEvent<any>) => void;
	export let CheckNote: (e: CustomEvent<any>) => void;

	export let listEvent: NostrEvent | undefined;
	export let bkm = 'pub'; //'pub'|'prv'
	export let isOwner: boolean;
	export let noEdit: boolean = false;
	export let pubkey: string;
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

	$: if (bkm || listEvent) {
		viewUpdate();
	} else {
		viewList = [];
		$listSize = 0;
	}
	$: console.log($listSize);
	let message: string;
	async function viewUpdate() {
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
					viewList = [];
					message = listEvent.content;
					// bkm = 'pub';
					// viewUpdate();
				}
			} else {
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
		: $isMulti
		? MenuMode.Multi
		: isOwner
		? MenuMode.other
		: MenuMode.none;
	$: menuEvent = noEdit
		? MenuMode.Viewer
		: $isMulti
		? MenuMode.Multi
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
</script>

{#if viewPage && viewPage.length > 0}
	{#each viewPage as tag, index}
		{#await getIdByTag(tag)}
			<!--loading a タグ　のなかみ-->
			<div class="z-0 card drop-shadow px-1 py-1 my-0.5">
				{tag}
			</div>
		{:then { id, filter, kind }}
			{#if tag[0] === 'd' || tag[0] === 'title' || tag[0] === 'image' || tag[0] === 'description'}
				<!--なんもしない-->
			{:else}
				<!-- ノート | ボタン群-->

				{#if tag[0] === 'e'}
					<!-- {#if $searchRelays && $searchRelays.length > 0}
					<NostrApp relays={$searchRelays}> -->
					<Text queryKey={[id]} {id} let:text>
						<div
							slot="loading"
							class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
						>
							<SearchCard
								{filter}
								message={`loading [${tag}]`}
								isPageOwner={isOwner}
							/>
							<MenuButtons
								myIndex={index}
								tagArray={tag}
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
								message={`error [${tag}]`}
								isPageOwner={isOwner}
							/>
							<MenuButtons
								myIndex={index}
								tagArray={tag}
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
								message={`not found [${tag}]`}
								isPageOwner={isOwner}
							/><MenuButtons
								myIndex={index}
								tagArray={tag}
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
									tagArray={tag}
									note={text}
									metadata={undefined}
									{pubkey}
								/><MenuButtons
									myIndex={index}
									tagArray={tag}
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
									tagArray={tag}
									note={text}
									metadata={undefined}
									{pubkey}
								/><MenuButtons
									myIndex={index}
									tagArray={tag}
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
									tagArray={tag}
									note={text}
									metadata={undefined}
									{pubkey}
								/><MenuButtons
									myIndex={index}
									tagArray={tag}
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
									tagArray={tag}
									note={text}
									{metadata}
									{pubkey}
								/>
								<MenuButtons
									myIndex={index}
									tagArray={tag}
									note={text}
									menuMode={menuEvent}
									on:DeleteNote={DeleteNote}
									on:MoveNote={MoveNote}
									on:CheckNote={CheckNote}
								/>
							</div>
						</Metadata>
					</Text>
				{:else if tag[0] === 'a'}
					<!-- {#if $searchRelays && $searchRelays.length > 0}
					<NostrApp relays={$searchRelays}> -->
					<UniqueEventList queryKey={tag} filters={[filter]} let:events>
						<div
							slot="loading"
							class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
						>
							<SearchCard
								{filter}
								message={`loading [${tag}]`}
								isPageOwner={isOwner}
							/><MenuButtons
								myIndex={index}
								tagArray={tag}
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
								message={`error [${tag}]`}
								isPageOwner={isOwner}
							/><MenuButtons
								myIndex={index}
								tagArray={tag}
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
								message={`not found [${tag}]`}
								isPageOwner={isOwner}
							/>
							<MenuButtons
								myIndex={index}
								tagArray={tag}
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
									tagArray={tag}
									note={uniqueEvent(events)}
									metadata={undefined}
									{pubkey}
								/><MenuButtons
									myIndex={index}
									tagArray={tag}
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
									tagArray={tag}
									note={uniqueEvent(events)}
									metadata={undefined}
									{pubkey}
								/><MenuButtons
									myIndex={index}
									tagArray={tag}
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
									tagArray={tag}
									note={uniqueEvent(events)}
									metadata={undefined}
									{pubkey}
								/><MenuButtons
									myIndex={index}
									tagArray={tag}
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
									tagArray={tag}
									note={uniqueEvent(events)}
									{metadata}
									{pubkey}
								/>
								<MenuButtons
									myIndex={index}
									tagArray={tag}
									note={uniqueEvent(events)}
									menuMode={menuEvent}
									on:DeleteNote={DeleteNote}
									on:MoveNote={MoveNote}
									on:CheckNote={CheckNote}
								/>
							</div>
						</Metadata>
					</UniqueEventList>
				{:else if tag[0] === 'p'}
					<Metadata
						queryKey={['metadata', tag[1]]}
						pubkey={tag[1]}
						let:metadata
					>
						<div
							slot="loading"
							class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1 break-all"
						>
							loading ... {JSON.stringify(tag)}
							<MenuButtons
								myIndex={index}
								tagArray={tag}
								note={undefined}
								menuMode={menuEvent}
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
							not found {JSON.stringify(tag)}<MenuButtons
								myIndex={index}
								tagArray={tag}
								note={undefined}
								menuMode={menuEvent}
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
							not found {JSON.stringify(tag)}<MenuButtons
								myIndex={index}
								tagArray={tag}
								note={undefined}
								menuMode={menuEvent}
								share={false}
								on:DeleteNote={DeleteNote}
								on:MoveNote={MoveNote}
								on:CheckNote={CheckNote}
							/>
						</div>
						<div
							class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
						>
							<ProfileCard {metadata} tagArray={tag} />
							<MenuButtons
								myIndex={index}
								tagArray={tag}
								note={metadata}
								menuMode={menuEvent}
								share={false}
								on:DeleteNote={DeleteNote}
								on:MoveNote={MoveNote}
								on:CheckNote={CheckNote}
							/>
						</div>
					</Metadata>
				{:else if tag[0] === 'emoji'}
					<!--えもじ-->
					<div
						class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1"
					>
						<Emoji tagArray={tag} />
						{#if isOwner}
							<button
								class="btn p-2 fill-surface-600 dark:fill-surface-300"
								on:click={() => {
									handleClick(index, tag);
								}}>{@html EditIcon}</button
							>
						{/if}
						<MenuButtons
							myIndex={index}
							tagArray={tag}
							note={undefined}
							menuMode={isOwner ? MenuMode.Owner : MenuMode.Viewer}
							on:DeleteNote={DeleteNote}
							on:MoveNote={MoveNote}
							on:CheckNote={CheckNote}
						/>
					</div>
				{:else if (tag[0] === 'r' && tag[1].startsWith('ws')) || tag[0] === 'relay'}
					<!--りれー-->
					<div
						class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1 break-all"
					>
						<Relay tagArray={tag} />
						{#if isOwner}
							<button
								class="btn p-2 fill-surface-600 dark:fill-surface-300"
								on:click={() => {
									handleClick(index, tag);
								}}>{@html EditIcon}</button
							>
						{/if}
						<MenuButtons
							myIndex={index}
							tagArray={tag}
							share={false}
							note={undefined}
							menuMode={isOwner ? MenuMode.Owner : MenuMode.none}
							on:DeleteNote={DeleteNote}
							on:MoveNote={MoveNote}
							on:CheckNote={CheckNote}
						/>
					</div>
				{:else}
					<!--a,e,d以外あとでかく-->

					<div
						class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1 break-all"
					>
						{JSON.stringify(tag)}
						{#if isOwner}
							<button
								class="btn p-2 fill-surface-600 dark:fill-surface-300"
								on:click={() => {
									handleClick(index, tag);
								}}>{@html EditIcon}</button
							>
						{/if}
						<MenuButtons
							myIndex={index}
							tagArray={tag}
							note={undefined}
							menuMode={isOwner ? MenuMode.Owner : MenuMode.none}
							on:DeleteNote={DeleteNote}
							on:MoveNote={MoveNote}
							on:CheckNote={CheckNote}
						/>
					</div>
				{/if}
			{/if}
		{/await}
	{/each}
{:else if message}
	<p class="h5 font-bold">【List's content】</p>
	<div class="break-all whitespace-break-spaces">{message}</div>
{/if}
