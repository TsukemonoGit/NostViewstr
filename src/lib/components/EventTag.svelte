<script lang="ts">
	//EventTag.svelte
	import { allView } from '$lib/stores/settings';
	import { nip19 } from 'nostr-tools';
	import Metadata from './nostrData/Metadata.svelte';
	import Text from './nostrData/Text.svelte';
	import { relaySet } from '$lib/stores/relays';
	export let tag: string[];
	export let handleClickDate: Function;
	export let handleClickPubkey: Function;
	export let pubkey: string;
</script>

<!-- {#if Relays()}
<NostrApp relays={Relays().searchRelays}> -->
{#if tag && tag.length > 0}
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
					>{#if metadata.content && JSON.parse(metadata.content).name !== ''}{JSON.parse(
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
		<Text
			queryKey={[tag[1]]}
			id={tag[1]}
			let:text
			relay={tag.length > 2 && tag[2] !== ''
				? [...new Set([...($relaySet[pubkey]?.mergeRelays || []), tag[2]])]
				: undefined}
		>
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
						if (tag && tag.length > 0) {
							handleClickDate(text, tag);
						}
					}}
				>
					[{tag[0]}]

					{#if text && Array.isArray(text.tags) && text.tags.some((tag) => tag[0] === 'content-warning') && $allView == false}
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
	{/if}{/if}
<!-- </NostrApp> -->
<!-- {/if} -->
