<script lang="ts">
	import type Nostr from 'nostr-typedef';
	import { page } from '$app/stores';
	import SampleCard from './SampleCard.svelte';
	import { _ } from 'svelte-i18n';
	export let light: boolean;
	const sampleProfile = {
		name: 'mono',
		display_name: '₍ ･ᴗ･ ₎',
		picture: './favicon.png'
	};
	const sampleMetadata: Nostr.Event = {
		content: JSON.stringify(sampleProfile),
		tags: [],
		pubkey: '',
		sig: '',
		id: '',
		kind: 0,
		created_at: 0
	};
	const sampleNote: Nostr.Event = {
		content: `  ${
			light ? $_('modal.info.urlandIconOn') : $_('modal.info.urlandIconOff')
		} sample note ${$page.url}`,
		tags: [],
		pubkey: '',
		sig: '',
		id: '',
		kind: 0,
		created_at: 0
	};
</script>

<div
	class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
>
	<SampleCard note={sampleNote} metadata={sampleMetadata} {light} />
</div>
