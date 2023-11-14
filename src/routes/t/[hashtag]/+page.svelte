<script lang="ts">
	import { Metadata, Nostr, NostrApp, UniqueEventList } from 'nosvelte';

	import { searchRelays } from '$lib/stores/relays';
	import EventCard from '$lib/components/EventCard.svelte';
	import { MenuMode } from '$lib/otherFunctions';
	import { page } from '$app/stores';
	const hashtag = $page.params.hashtag;

	const filter: Nostr.Filter = { '#t': [hashtag], limit: 30, kinds: [42, 1] };
	console.log(filter);
	function DeleteNote() {}
	function MoveNote() {}
	function CheckNote() {}
</script>

{#if $searchRelays.length > 0}
	<NostrApp relays={$searchRelays}>
		<UniqueEventList
			queryKey={['hashtag', hashtag]}
			filters={[filter]}
			let:events
		>
			<div slot="loading">noe loading...</div>
			<div slot="error">error</div>
			<div slot="nodata">nodata</div>
			{#if events.length > 0}
				{#each events as event, index}
					<Metadata
						queryKey={['metadata', event.pubkey]}
						pubkey={event.pubkey}
						let:metadata
					>
						<EventCard
							slot="loading"
							isPageOwner={true}
							menuMode={MenuMode.none}
							tagArray={[]}
							note={event}
							metadata={undefined}
							myIndex={index}
							{DeleteNote}
							{MoveNote}
							{CheckNote}
						/>
						<EventCard
							slot="error"
							isPageOwner={true}
							menuMode={MenuMode.none}
							tagArray={[]}
							note={event}
							metadata={undefined}
							myIndex={index}
							{DeleteNote}
							{MoveNote}
							{CheckNote}
						/>
						<EventCard
							slot="nodata"
							isPageOwner={true}
							menuMode={MenuMode.none}
							tagArray={[]}
							note={event}
							metadata={undefined}
							myIndex={index}
							{DeleteNote}
							{MoveNote}
							{CheckNote}
						/>

						<EventCard
							isPageOwner={true}
							menuMode={MenuMode.none}
							tagArray={[]}
							note={event}
							{metadata}
							myIndex={index}
							{DeleteNote}
							{MoveNote}
							{CheckNote}
						/>
					</Metadata>
				{/each}
			{/if}
		</UniqueEventList>
	</NostrApp>
{:else}
	no relay
{/if}
