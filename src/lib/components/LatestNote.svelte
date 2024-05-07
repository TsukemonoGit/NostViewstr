<script lang="ts">
	import { formatAbsoluteDate, formatRelativeDate } from '$lib/otherFunctions';
	import { Nostr, UniqueEventList } from 'nosvelte';
	import Content from './Content.svelte';
	import { allView } from '$lib/stores/settings';
	import LatestEvent from './LatestEvent.svelte';
	export let pubkey: string;

	// const latestNote = (events: Nostr.Event<number>[]): Nostr.Event<number> => {
	// 	//console.log(events);
	// 	const sortedNote = events.sort((a, b) => b.created_at - a.created_at);
	// 	return sortedNote[0];
	// };
</script>

<LatestEvent
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

	<!-- {#await latestNote(events) then event} -->
	<div class="my-2">
		<hr class="!border-dashed my-1" />
		<div class="flex gap-2 items-center text-center my-1">
			<div class="font-semibold">Recent Note</div>
			<div class="text-sm">{formatAbsoluteDate(events.created_at)}</div>
		</div>
		<div class="text-sm break-all max-h-60 overflow-y-auto">
			<Content
				text={events.content}
				tag={events.tags}
				id={events.id}
				view={$allView}
				isPageOwner={false}
				pubkey={events.pubkey}
			/>
		</div>
	</div>
	<!-- {/await} -->
</LatestEvent>
