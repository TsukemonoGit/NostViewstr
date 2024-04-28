<script lang="ts">
	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import { _ } from 'svelte-i18n';
	import type { PageData } from './$types';

	import FooterMenu from '$lib/components/FooterMenu.svelte';

	import { nip19 } from 'nostr-tools';

	export let data: PageData;
	const kind = data.kind;
	const identifier = data.identifier;
	console.log('PageData', data.pubkey);
	let settings: boolean = false;
	async function settingFunc() {
		settings = true;
	}
	// $: console.log($URLPreview);
	// $: console.log($iconView);
	// onMount(async () => {
	// 	if ($pubkey_viewer === undefined || $pubkey_viewer === '') {
	// 		$pubkey_viewer = await getPub();
	// 	}
	// });
	// onMount(async () => {
	// 	console.log(await getRelays(data.pubkey));
	// }); //await setRelays(testRelay);}}
</script>

<svelte:head>
	<meta
		name="description"
		content="nostr kind:{data.kind} ID:{identifier}
pubkey:{nip19.npubEncode(data.pubkey)}"
	/>

	<meta
		property="og:description"
		content="kind:{data.kind} ID:{identifier}
pubkey:{nip19.npubEncode(data.pubkey)}"
	/>
</svelte:head>

{#if !settings}
	<div
		class="container min-w-[80vw] h-full mx-auto flex justify-center items-center p-4"
	>
		<div class="mt-5">
			<h1 class="h1 mb-5">{$_('main.title')}</h1>

			<div class="space-t-5">
				kind:{data.kind}
				<Settings {settingFunc} />
			</div>
		</div>
	</div>
{:else}
	<ListedEventList
		bind:pubkey={data.pubkey}
		{kind}
		{identifier}
		isNaddr={true}
	/>
{/if}
