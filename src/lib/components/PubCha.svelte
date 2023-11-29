<!--kind:40-->
<script lang="ts">
	import { iconView } from '$lib/stores/settings';
	import { nip19 } from 'nostr-tools';
	import OpenIcon from '@material-design-icons/svg/round/open_in_new.svg?raw';
	export let text: string;

	export let id: string;

	export let isPageOwner: boolean;
	export let pubkey: string;
	let name: string;
	let picture: string;
	let about: string;
	$: console.log($iconView);
	$: console.log(picture);
	$: if (text) {
		try {
			const parseText = JSON.parse(text);
			name = parseText.name ?? '';
			picture = parseText.picture ?? '';
			about = parseText.about ?? '';
		} catch (error) {
			name = text; //パースできなかったらそのままひょうじ
		}
	}
	let data: string;

	$: if (id) {
		data = nip19.neventEncode({ id: id });
	}
	$: chatURL = `https://unyu-house.vercel.app/channels/${data}`;
</script>

<div class="grid grid-cols-[auto_1fr] gap-1">
	<div>
		{#if $iconView && picture}
			<img
				class="m-2 max-w-16 max-h-16 object-contain justify-center"
				src={picture}
				alt={picture}
			/>
		{/if}
	</div>
	<div class="grid grid-rows-[auto_auto_1fr]">
		<div class="flex gap-2">
			<div class=" h6">{name}</div>
			<a
				rel="external noreferrer"
				target="_blank"
				href={chatURL}
				class="anchor text-sm openIcon flex dark:fill-white"
				>うにゅうハウス {@html OpenIcon}</a
			>
		</div>

		<div class="mt-2">{about}</div>
	</div>
</div>

<style>
	:global(.openIcon svg) {
		width: 1em;
		height: 1em;
	}
</style>
