<!--kind:40-->
<script lang="ts">
	import { iconView } from '$lib/stores/settings';
	import { nip19 } from 'nostr-tools';

	import type Nostr from 'nostr-typedef';
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
