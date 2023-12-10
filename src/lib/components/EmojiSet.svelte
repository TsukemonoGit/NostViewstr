<!--kind:40-->
<script lang="ts">
	import { nip19 } from 'nostr-tools';
	import type { Nostr } from 'nosvelte';
	import OpenInNewIcon from '@material-design-icons/svg/round/open_in_new.svg?raw';
	export let event: Nostr.Event;
	const dtag = event?.tags?.find((item) => item[0] === 'd');
	const emojisURL = 'https://emojis-iota.vercel.app/';
	const openEmojiURL =
		emojisURL +
		'a/' +
		nip19.naddrEncode({
			identifier: dtag && dtag.length > 1 ? dtag[1] : '',
			pubkey: event.pubkey,
			kind: event.kind
		});
</script>

<div class="grid grid-rows-[auto_1fr] w-full">
	<div class="h4">{dtag && dtag.length > 1 ? dtag[1] : '(noname)'}</div>
	<div class="card p-2 m-1 bg-surface-50 dark:bg-surface-50">
		{#each event?.tags as list, index}
			{#if list[0] === 'emoji'}
				<img
					src={list[2]}
					alt={list[1]}
					class="max-h-[1.5em] w-fit inline-flex"
				/>
			{/if}
		{/each}
	</div>
	<a
		class="anchor text-sm flex justify-end"
		rel="external noreferrer"
		target="_blank"
		href={openEmojiURL}
		>Open in emojis-iota<span
			class="flex icon dark:fill-surface-400 fill-surface-600"
			>{@html OpenInNewIcon}</span
		></a
	>
</div>

<style>
	:global(.icon svg) {
		width: 0.8em;
		height: 0.8em;
	}
</style>
