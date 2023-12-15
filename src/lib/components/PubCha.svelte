<!--kind:40-->
<script lang="ts">
	import { iconView } from '$lib/stores/settings';
	import { nip19 } from 'nostr-tools';
	import OpenIcon from '@material-design-icons/svg/round/open_in_new.svg?raw';
	import type { Nostr } from 'nosvelte';
	import Ogp from './OGP.svelte';
	export let text: string;

	export let id: string;

	export let event: Nostr.Event;
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

	//eventがkind41のばあい、40のイベントID（tagsのなかのeタグ）を探してそこのneventにリンクさせる
	let chatURL: string;
	$: if (event.kind === 40) {
		chatURL = `https://unyu-house.vercel.app/channels/${data}`;
	} else {
		const tmp = event.tags.find((item) => item[0] === 'e');
		if (tmp) {
			try {
				const nevent = nip19.neventEncode({ id: tmp[1] });
				chatURL = `https://unyu-house.vercel.app/channels/${nevent}`;
			} catch (error) {
				chatURL = `https://unyu-house.vercel.app/`;
			}
		}
	}
</script>

<Ogp
	ogp={{
		memo: 'kind:' + event.kind + '  Public Chat ',
		title: name,
		image: picture,
		description: about,
		favicon: `https://unyu-house.vercel.app/favicon.ico`
	}}
	url={chatURL}
/>

<!-- <div class="grid grid-cols-[auto_1fr] gap-1">
	<div class="w-fit">
		{#if $iconView && picture}
			<img
				class="m-2 max-w-16 max-h-16 object-contain justify-center"
				src={picture}
				alt=""
			/>
		{/if}
	</div>
	<div class="grid grid-rows-[auto_auto_1fr]">
		<div class="flex gap-2">
			<div class=" h5">{name}</div>
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
 -->
