<script lang="ts">
	import { page } from '$app/stores';
	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';

	import {
		URLPreview,
		iconView,
		settings,
		nowProgress
	} from '$lib/stores/settings';
	import {
		LightSwitch,
		ProgressBar,
		ProgressRadial
	} from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';

	import FooterMenu from '$lib/components/FooterMenu.svelte';
	import { searchRelays, postRelays, bookmarkRelays } from '$lib/stores/relays';
	import { onMount } from 'svelte';
	import { getRelays } from '$lib/nostrFunctions';

	export let data: PageData;
	console.log('PageData', data.pubkey);

	$: console.log($URLPreview);
	$: console.log($iconView);
	onMount(async () => {
		console.log(await getRelays(data.pubkey));
	}); //await setRelays(testRelay);}}
</script>

<!-- <div class="break-all">
	<p>npub:{$page.params.npub}</p>
	<p>read:{$searchRelays}</p>
	<p>write:{$postRelays}</p>
	<p>kind:?</p>
</div> -->

{#if !$settings}
	<Settings />
{:else}
	<ListedEventList pubkey={data.pubkey} />
{/if}
<FooterMenu />
