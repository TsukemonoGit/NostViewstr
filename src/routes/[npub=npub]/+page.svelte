<script lang="ts">
	import { page } from '$app/stores';
	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';

	import { URLPreview, iconView, settings } from '$lib/stores/settings';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';

	import FooterMenu from '$lib/components/FooterMenu.svelte';
	import { searchRelays, postRelays, bookmarkRelays } from '$lib/stores/relays';

	export let data: PageData;
	console.log('PageData', data.pubkey);

	$: console.log($URLPreview);
	$: console.log($iconView);
</script>

<p>npub:{$page.params.npub}</p>
<p>read:{$searchRelays}</p>
<p>write:{$postRelays}</p>
<p>kind:?</p>

<LightSwitch />
{#if !$settings}
	<Settings />
{:else}
	<ListedEventList />
{/if}
<FooterMenu />
