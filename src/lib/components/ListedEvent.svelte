<script lang="ts">
	import { _ } from 'svelte-i18n';
	import EventCard from '$lib/components/EventCard.svelte';
	import { MenuMode } from '$lib/functions';
	import { searchRelays } from '$lib/stores/relays';
	import { Metadata, NostrApp, Text, UniqueEventList } from 'nosvelte';
	import type { Event as NostrEvent } from 'nostr-tools';
	import { getIdByTag, nip04De } from '$lib/nostrFunctions';
	import SearchCard from './SearchCard.svelte';

	import { amount, pageNum, listSize } from '$lib/stores/pagination';
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
			try {
				const decypt = await nip04De(list.pubkey, list.content);
				return JSON.parse(decypt);
			} catch (error) {
				console.error('復号失敗');
				return [];
			}
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
	async function viewUpdate() {
		if (listEvent) {
			if (bkm === 'pub') {
				$listSize = listEvent?.tags.length;
				viewList = listEvent?.tags;
			} else {
				const res = await privateList(listEvent);
				$listSize = res.length;
				viewList = res;
			}
		} else {
			$listSize = 0;
			viewList = [];
		}
	}
	$: console.log($listSize, $amount, $pageNum);

	$: viewPage = viewList.slice(
		Math.min($pageNum, Math.floor($listSize / $amount)) * $amount,
		($pageNum + 1) * Math.min($amount, $listSize - 1)
	);
</script>

{#if viewPage && viewPage.length > 0}
	{#each viewPage as tag, index}
		{#await getIdByTag(tag)}
			<!--loading a タグ　のなかみ-->
		{:then { id, filter, kind }}
			{#if tag[0] === 'e'}
				{#if $searchRelays && $searchRelays.length > 0}
					<NostrApp relays={$searchRelays}>
						<Text queryKey={[id]} {id} let:text>
							<SearchCard
								slot="loading"
								{filter}
								message={`loading [${tag}]`}
								isPageOwner={true}
								menuMode={isOwner ? MenuMode.other : MenuMode.none}
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
								menuMode={isOwner ? MenuMode.other : MenuMode.none}
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
								menuMode={isOwner ? MenuMode.other : MenuMode.none}
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
									menuMode={isOwner ? MenuMode.Owner : MenuMode.Viewer}
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
									menuMode={isOwner ? MenuMode.Owner : MenuMode.Viewer}
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
									menuMode={isOwner ? MenuMode.Owner : MenuMode.Viewer}
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
									menuMode={isOwner ? MenuMode.Owner : MenuMode.Viewer}
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
					</NostrApp>
				{:else}
					<!--りれーせっていないとき-->
					<SearchCard
						{filter}
						message={`not found [${tag}]`}
						isPageOwner={true}
						menuMode={isOwner ? MenuMode.other : MenuMode.none}
						tagArray={tag}
						myIndex={index}
						{DeleteNote}
						{MoveNote}
						{CheckNote}
					/>
				{/if}
			{:else if tag[0] === 'a'}
				{#if $searchRelays && $searchRelays.length > 0}
					<NostrApp relays={$searchRelays}>
						<UniqueEventList queryKey={tag} filters={[filter]} let:events>
							<SearchCard
								slot="loading"
								{filter}
								message={`loading [${tag}]`}
								isPageOwner={true}
								menuMode={isOwner ? MenuMode.other : MenuMode.none}
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
								menuMode={isOwner ? MenuMode.other : MenuMode.none}
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
								menuMode={isOwner ? MenuMode.other : MenuMode.none}
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
									menuMode={isOwner ? MenuMode.Owner : MenuMode.Viewer}
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
									menuMode={isOwner ? MenuMode.Owner : MenuMode.Viewer}
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
									menuMode={isOwner ? MenuMode.Owner : MenuMode.Viewer}
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
									menuMode={isOwner ? MenuMode.Owner : MenuMode.Viewer}
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
					</NostrApp>
				{:else}
					<!--リレー設定ないとき-->
					<SearchCard
						{filter}
						message={`not found [${tag}]`}
						isPageOwner={true}
						menuMode={isOwner ? MenuMode.other : MenuMode.none}
						tagArray={tag}
						myIndex={index}
						{DeleteNote}
						{MoveNote}
						{CheckNote}
					/>
				{/if}
			{:else if tag[0] === 'd'}
				<!--なんもしない-->
			{:else}
				<!--a,e,d以外あとでかく-->
				{tag}
			{/if}
		{/await}
	{/each}
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
