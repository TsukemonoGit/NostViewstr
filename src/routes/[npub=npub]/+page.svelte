<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';

	import {
		URLPreview,
		iconView,
		settings,
		nowProgress,
		pubkey_viewer
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
	import { getPub, getRelays } from '$lib/nostrFunctions';

	export let data: PageData;
	const kind = 30001;
	console.log('PageData', data.pubkey);
	let onmount: boolean = false;
	// onMount(() => {
	// 	console.log('test');
	// 	onmount = true;
	// });
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

<!-- <div class="break-all">
	<p>npub:{$page.params.npub}</p>
	<p>read:{$searchRelays}</p>
	<p>write:{$postRelays}</p>
	<p>kind:?</p>
</div> -->

{#if !$settings}
	<div class="container h-full mx-auto flex justify-center items-center">
		<div class="mt-5">
			<h1 class="h1 mb-5">{$_('main.title')}</h1>
			<Settings />
		</div>
	</div>
{:else}
	<ListedEventList pubkey={data.pubkey} {kind} isNaddr={false} />
{/if}
<FooterMenu pubkey={data.pubkey} {kind} />
