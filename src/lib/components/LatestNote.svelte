<script lang="ts">
	import { formatDate } from '$lib/otherFunctions';
	import { Nostr, UniqueEventList } from 'nosvelte';
	import Content from './Content.svelte';
	import { allView } from '$lib/stores/settings';
	export let pubkey: string;

	const latestNote = (events: Nostr.Event<number>[]): Nostr.Event<number> => {
		//console.log(events);
		const sortedNote = events.sort((a, b) => b.created_at - a.created_at);
		return sortedNote[0];
	};
</script>

<UniqueEventList
	queryKey={['latest', pubkey]}
	filters={[{ authors: [pubkey], limit: 1, kinds: [1] }]}
	let:events
>
	<!-- <div slot="loading">
		<p>Loading...</p>
	</div>

	<div slot="error" let:error>
		<p>{error}</p>
	</div> -->

	{#await latestNote(events) then event}
		<div class="my-2">
			<hr class="!border-dashed my-1" />
			<div class="flex gap-2 items-center text-center my-1">
				<div class="font-semibold">Latest Note</div>
				<div class="text-sm">{formatDate(event.created_at)}</div>
			</div>
			<div class="text-sm break-all">
				<Content
					text={event.content}
					tag={event.tags}
					id={event.id}
					view={$allView}
					isPageOwner={false}
					pubkey={event.pubkey}
				/>
			</div>
		</div>
	{/await}
</UniqueEventList>
