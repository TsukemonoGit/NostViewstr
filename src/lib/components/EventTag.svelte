<script lang="ts">
	import { allView } from '$lib/stores/settings';
	import { nip19 } from 'nostr-tools';
	import { Metadata, Nostr, NostrApp, Text } from 'nosvelte';

	export let tag: string[];
	export let handleClickDate: Function;
	export let handleClickPubkey: Function;
</script>

<!-- {#if Relays()}
<NostrApp relays={Relays().searchRelays}> -->

{#if tag[0] === 'p'}
	<Metadata queryKey={['metadata', tag[1]]} pubkey={tag[1]} let:metadata>
		<div slot="loading">
			<div class="-mt-0.5 px-2 opacity-70 text-sm overflow-x-hidden">
				<!-- {tag[tag.length - 1] === 'mention' ? 'mention' : 'to'} -->
				[p] {tag[1]}
			</div>
		</div>
		<div slot="error">
			<div class="-mt-0.5 px-2 opacity-70 text-sm overflow-x-hidden">
				<!-- {tag[tag.length - 1] === 'mention' ? 'mention' : 'to'} -->
				[p] {tag[1]}
			</div>
		</div>

		<div slot="nodata">
			<div class="-mt-0.5 px-2 opacity-70 text-sm overflow-x-hidden">
				<!-- {tag[tag.length - 1] === 'mention' ? 'mention' : 'to'} -->
				[p] {tag[1]}
			</div>
		</div>
		<div class="-mt-0.5 px-2 opacity-70 text-sm overflow-x-hidden">
			<!-- {tag[tag.length - 1] === 'mention' ? 'mention' : 'to'} -->
			[p]
			<button
				class=" w-full truncate text-start"
				on:click={() => {
					handleClickPubkey(metadata, tag[1]);
				}}
				>{#if JSON.parse(metadata.content).name !== ''}{JSON.parse(
						metadata.content
					).name}
				{:else}
					{nip19.npubEncode(metadata.pubkey).slice(0, 12)}:{nip19
						.npubEncode(metadata.pubkey)
						.slice(-4)}
				{/if}</button
			>
		</div>
	</Metadata>
{:else if tag[0] === 'e' || tag[0] === 'q'}
	<Text queryKey={[tag[1]]} id={tag[1]} let:text>
		<div slot="loading">
			<div class="-mt-0.5 px-2 opacity-70 text-sm overflow-x-hidden">
				[{tag[0]}] {tag[1]}
			</div>
		</div>
		<div slot="error">
			<div class="-mt-0.5 px-2 opacity-70 text-sm overflow-x-hidden">
				[{tag[0]}] {tag[1]}
			</div>
		</div>

		<div slot="nodata">
			<div class="-mt-0.5 px-2 opacity-70 text-sm overflow-x-hidden">
				[{tag[0]}] {tag[1]}
			</div>
		</div>

		<div class="-mt-1 px-2">
			<button
				class=" opacity-70 text-sm w-full truncate overflow-x-hidden text-start"
				on:click={() => {
					handleClickDate(text, tag);
				}}
			>
				[{tag[0]}]

				{#if text.tags.some((tag) => tag[0] === 'content-warning') && $allView == false}
					{'<content-warning>'}
				{:else}
					{text.content}
				{/if}</button
			>
		</div>
	</Text>
{:else}
	<div
		class="-mt-0.5 px-2 opacity-70 text-sm whitespace-nowrap overflow-x-hidden"
	>
		[{tag[0]}]
		{tag[1]}
	</div>
{/if}
<!-- </NostrApp> -->
<!-- {/if} -->
