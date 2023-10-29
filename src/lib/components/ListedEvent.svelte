<script lang="ts">
	import EventCard from '$lib/components/EventCard.svelte';
	import { MenuMode } from '$lib/functions';
	import { searchRelays } from '$lib/stores/relays';
	import { Metadata, NostrApp, Text, UniqueEventList } from 'nosvelte';
	import OtherCard from '$lib/components/OtherCard.svelte';
	import type { Event as NostrEvent } from 'nostr-tools';
	import { getIdByTag } from '$lib/nostrFunctions';
	import SearchCard from './SearchCard.svelte';
	export let DeleteNote: (e: CustomEvent<any>) => void;
	export let MoveNote: (e: CustomEvent<any>) => void;
	export let CheckNote: (e: CustomEvent<any>) => void;

	export let listEvent: NostrEvent;

	//一つのタグに一種類のイベントしかないことにして日付だけ見る
	const uniqueEvent = (eventList: NostrEvent[]): NostrEvent => {
		//console.log(eventList);
		eventList.sort((a, b) => b.created_at - a.created_at);
		return eventList[0];
	};
</script>

{#if $searchRelays}
	<NostrApp relays={$searchRelays}>
		{#each listEvent.tags as tag, index}
			{#await getIdByTag(tag)}
				<!--loading a タグ　のなかみ-->
			{:then { id, filter, kind }}
				{#if tag[0] === 'e'}
					<Text queryKey={[id]} {id} let:text>
						<SearchCard
							slot="loading"
							{filter}
							message={`loading [${tag}]`}
							isPageOwner={true}
							menuMode={MenuMode.other}
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
							menuMode={MenuMode.other}
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
							menuMode={MenuMode.other}
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
								menuMode={MenuMode.Owner}
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
								menuMode={MenuMode.Owner}
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
								menuMode={MenuMode.Owner}
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
								menuMode={MenuMode.Owner}
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
				{:else if tag[0] === 'a'}
					<UniqueEventList queryKey={tag} filters={[filter]} let:events>
						<SearchCard
							slot="loading"
							{filter}
							message={`loading [${tag}]`}
							isPageOwner={true}
							menuMode={MenuMode.other}
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
							menuMode={MenuMode.other}
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
							menuMode={MenuMode.other}
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
								menuMode={MenuMode.Owner}
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
								menuMode={MenuMode.Owner}
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
								menuMode={MenuMode.Owner}
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
								menuMode={MenuMode.Owner}
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
				{:else}
					<!--あとでかく-->
					{tag}
				{/if}
			{/await}
		{/each}

		<!-- <EventCard
			tagArray={['e', test.id]}
			note={test}
			metadata={undefined}
			myIndex={0}
			on:DeleteNote={DeleteNote}
			on:MoveNote={MoveNote}
			on:CheckNote={CheckNote}
			menuMode={MenuMode.Multi}
		/>
		<EventCard
			tagArray={['e', test.id]}
			note={test}
			{metadata}
			myIndex={1}
			on:DeleteNote={DeleteNote}
			on:MoveNote={MoveNote}
			on:CheckNote={CheckNote}
			menuMode={MenuMode.Owner}
		/>
		<EventCard
			tagArray={[
				'a',
				'30001:84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5:bookmark'
			]}
			note={test}
			{metadata}
			myIndex={2}
			on:DeleteNote={DeleteNote}
			on:MoveNote={MoveNote}
			on:CheckNote={CheckNote}
			menuMode={MenuMode.Viewer}
		/>
		<EventCard
			tagArray={['e', test2.id]}
			note={test2}
			metadata={undefined}
			myIndex={3}
			on:DeleteNote={DeleteNote}
			on:MoveNote={MoveNote}
			on:CheckNote={CheckNote}
			menuMode={MenuMode.Viewer}
		/> -->
	</NostrApp>
{/if}
