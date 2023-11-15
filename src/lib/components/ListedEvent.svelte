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
	export let DeleteNote: (e: CustomEvent<any>) => void;
	export let MoveNote: (e: CustomEvent<any>) => void;
	export let CheckNote: (e: CustomEvent<any>) => void;

	export let listEvent: NostrEvent;
	export let bkm = 'pub'; //'pub'|'prv'
	export let isOwner: boolean;
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
	let viewList: string[][] = [];
	$: if (listEvent || bkm) {
		viewUpdate();
	} else {
		viewList = [];
		$listSize = 0;
	}
	let message: string;
	async function viewUpdate() {
		message = '';
		if (listEvent) {
			if (bkm === 'pub') {
				$listSize = listEvent?.tags.length;
				viewList = listEvent?.tags;
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
	$: console.log($listSize, $amount, $pageNum);

	$: viewPage = viewList.slice(
		Math.min($pageNum, Math.floor($listSize / $amount)) * $amount,
		($pageNum + 1) * Math.min($amount, $listSize)
	);
	$: console.log(viewPage);
	$: console.log(Math.min($pageNum, Math.floor($listSize / $amount)) * $amount);
	$: console.log(($pageNum + 1) * Math.min($amount, $listSize));
	$: menuSearch = $isMulti
		? MenuMode.Multi
		: isOwner
		? MenuMode.other
		: MenuMode.none;
	$: menuEvent = $isMulti
		? MenuMode.Multi
		: isOwner
		? MenuMode.Owner
		: MenuMode.Viewer;
</script>

{#if viewPage && viewPage.length > 0}
	{#each viewPage as tag, index}
		{#await getIdByTag(tag)}
			<!--loading a タグ　のなかみ-->
			<div class="z-0 card drop-shadow px-1 py-1 my-0.5">
				{tag}
			</div>
		{:then { id, filter, kind }}
			{#if tag[0] === 'e'}
				<!-- {#if $searchRelays && $searchRelays.length > 0}
					<NostrApp relays={$searchRelays}> -->
				<Text queryKey={[id]} {id} let:text>
					<SearchCard
						slot="loading"
						{filter}
						message={`loading [${tag}]`}
						isPageOwner={true}
						menuMode={menuSearch}
						tagArray={tag}
						myIndex={index}
						{DeleteNote}
						{MoveNote}
						{CheckNote}
					/>

					<SearchCard
						slot="error"
						{filter}
						message={`error [${tag}]`}
						isPageOwner={true}
						menuMode={menuSearch}
						tagArray={tag}
						myIndex={index}
						{DeleteNote}
						{MoveNote}
						{CheckNote}
					/>

					<SearchCard
						slot="nodata"
						{filter}
						message={`not found [${tag}]`}
						isPageOwner={true}
						menuMode={menuSearch}
						tagArray={tag}
						myIndex={index}
						{DeleteNote}
						{MoveNote}
						{CheckNote}
					/>

					<Metadata
						queryKey={['metadata', text.pubkey]}
						pubkey={text.pubkey}
						let:metadata
					>
						<EventCard
							slot="loading"
							isPageOwner={true}
							menuMode={menuEvent}
							tagArray={tag}
							note={text}
							metadata={undefined}
							myIndex={index}
							{DeleteNote}
							{MoveNote}
							{CheckNote}
						/>
						<EventCard
							slot="error"
							isPageOwner={true}
							menuMode={menuEvent}
							tagArray={tag}
							note={text}
							metadata={undefined}
							myIndex={index}
							{DeleteNote}
							{MoveNote}
							{CheckNote}
						/>
						<EventCard
							slot="nodata"
							isPageOwner={true}
							menuMode={menuEvent}
							tagArray={tag}
							note={text}
							metadata={undefined}
							myIndex={index}
							{DeleteNote}
							{MoveNote}
							{CheckNote}
						/>

						<EventCard
							isPageOwner={true}
							menuMode={menuEvent}
							tagArray={tag}
							note={text}
							{metadata}
							myIndex={index}
							{DeleteNote}
							{MoveNote}
							{CheckNote}
						/>
					</Metadata>
				</Text>
				<!-- </NostrApp> -->
				<!--ノートごとにNostrAppはあかんやろ
					修正NostrAppはListedEventListへ-->
				<!-- {:else}
				
					<SearchCard
						{filter}
						message={`not found [${tag}]`}
						isPageOwner={true}
						menuMode={menuSearch}
						tagArray={tag}
						myIndex={index}
						{DeleteNote}
						{MoveNote}
						{CheckNote}
					/> 
				{/if}-->
			{:else if tag[0] === 'a'}
				<!-- {#if $searchRelays && $searchRelays.length > 0}
					<NostrApp relays={$searchRelays}> -->
				<UniqueEventList queryKey={tag} filters={[filter]} let:events>
					<SearchCard
						slot="loading"
						{filter}
						message={`loading [${tag}]`}
						isPageOwner={true}
						menuMode={menuSearch}
						tagArray={tag}
						myIndex={index}
						{DeleteNote}
						{MoveNote}
						{CheckNote}
					/>

					<SearchCard
						slot="error"
						{filter}
						message={`error [${tag}]`}
						isPageOwner={true}
						menuMode={menuSearch}
						tagArray={tag}
						myIndex={index}
						{DeleteNote}
						{MoveNote}
						{CheckNote}
					/>

					<SearchCard
						slot="nodata"
						{filter}
						message={`not found [${tag}]`}
						isPageOwner={true}
						menuMode={menuSearch}
						tagArray={tag}
						myIndex={index}
						{DeleteNote}
						{MoveNote}
						{CheckNote}
					/>

					<Metadata
						queryKey={['metadata', uniqueEvent(events).pubkey]}
						pubkey={uniqueEvent(events).pubkey}
						let:metadata
					>
						<EventCard
							slot="loading"
							isPageOwner={true}
							menuMode={menuEvent}
							tagArray={tag}
							note={uniqueEvent(events)}
							metadata={undefined}
							myIndex={index}
							{DeleteNote}
							{MoveNote}
							{CheckNote}
						/>
						<EventCard
							slot="error"
							isPageOwner={true}
							menuMode={menuEvent}
							tagArray={tag}
							note={uniqueEvent(events)}
							metadata={undefined}
							myIndex={index}
							{DeleteNote}
							{MoveNote}
							{CheckNote}
						/>
						<EventCard
							slot="nodata"
							isPageOwner={true}
							menuMode={menuEvent}
							tagArray={tag}
							note={uniqueEvent(events)}
							metadata={undefined}
							myIndex={index}
							{DeleteNote}
							{MoveNote}
							{CheckNote}
						/>

						<EventCard
							isPageOwner={true}
							menuMode={menuEvent}
							tagArray={tag}
							note={uniqueEvent(events)}
							{metadata}
							myIndex={index}
							{DeleteNote}
							{MoveNote}
							{CheckNote}
						/>
					</Metadata>
				</UniqueEventList>
				<!-- </NostrApp> -->
				<!--リレー設定ないとき-->
				<!-- {:else}
				
					<SearchCard
						{filter}
						message={`not found [${tag}]`}
						isPageOwner={true}
						menuMode={menuSearch}
						tagArray={tag}
						myIndex={index}
						{DeleteNote}
						{MoveNote}
						{CheckNote}
					/> 
				{/if}-->
			{:else if tag[0] === 'd' || tag[0] === 'title' || tag[0] === 'image' || tag[0] === 'summary'}
				<!--なんもしない-->
			{:else}
				<!--a,e,d以外あとでかく-->
				<div class="z-0 card drop-shadow px-1 py-1 my-0.5 break-all">
					<div class="grid grid-cols-[1fr_auto]">
						{JSON.stringify(tag)}

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
				</div>
			{/if}
		{/await}
	{/each}
{:else if message}
	<p class="h5 font-bold">【List's content】</p>
	<div class="break-all whitespace-break-spaces">{message}</div>
{/if}

<div class="card p-1 variant-filled-secondary z-20" data-popup="popupShare">
	<p>{$_('popup.Share')}</p>
	<div class="arrow variant-filled-secondary z-20" />
</div>

<div class="card p-1 variant-filled-secondary z-20" data-popup="popupOpen">
	<p>{$_('popup.open')}</p>
	<div class="arrow variant-filled-secondary z-20" />
</div>
<div class="card p-1 variant-filled-secondary z-20" data-popup="popupMove">
	<p>{$_('popup.move')}</p>
	<div class="arrow variant-filled-secondary z-20" />
</div>
<div class="card p-1 variant-filled-secondary z-20" data-popup="popupDelete">
	<p>{$_('popup.delete')}</p>
	<div class="arrow variant-filled-secondary z-20" />
</div>
