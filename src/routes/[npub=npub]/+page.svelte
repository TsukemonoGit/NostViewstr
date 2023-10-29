<script lang="ts">
	import { page } from '$app/stores';
	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';

	import { URLPreview, iconView, settings } from '$lib/stores/settings';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import { getRelays, setRelays } from '$lib/nostrFunctions';
	import { onMount } from 'svelte';
	import { testRelay } from '$lib/testData/test.js';
	import FooterMenu from '$lib/components/FooterMenu.svelte';
	import { searchRelays, postRelays } from '$lib/stores/relays';
	export let data: PageData;
	console.log('PageData', data.pubkey);

	$: console.log($URLPreview);
	$: console.log($iconView);
	onMount(async () => {
		//console.log(await getRelays(data.pubkey));

		await setRelays(testRelay);
	});
</script>

<p>npub:{$page.params.npub}</p>
<p>read:{$searchRelays}</p>
<p>write:{$postRelays}</p>
<LightSwitch />
{#if !$settings}
	<Settings />
{:else}
	<ListedEventList />
{/if}
<FooterMenu />
