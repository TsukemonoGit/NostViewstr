<script lang="ts">
	import { page } from '$app/stores';
	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';

	import { URLPreview, iconView, settings } from '$lib/stores/settings';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import { getRelays, setRelays } from '$lib/nostrFunctions';
	import { onMount } from 'svelte';
	import { testRelay } from '$lib/test.js';
	export let data: PageData;
	console.log('PageData', data.pubkey);

	$: console.log($URLPreview);
	$: console.log($iconView);
	onMount(async () => {
		//console.log(await getRelays(data.pubkey));

		await setRelays(testRelay);
	});
</script>

npub:{$page.params.npub}
<LightSwitch />
{#if !$settings}
	<Settings />
{:else}
	<ListedEventList />
{/if}
