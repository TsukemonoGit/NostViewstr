<script lang="ts">
	import { _ } from 'svelte-i18n';

	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';

	import { settings } from '$lib/stores/settings';

	import type { PageData } from './$types';

	import FooterMenu from '$lib/components/FooterMenu.svelte';

	export let data: PageData;

	console.log('PageData', data.pubkey);

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

			<div class="space-t-5">
				kind:{data.kind}
				<Settings />
			</div>
		</div>
	</div>
{:else}
	<ListedEventList pubkey={data.pubkey} kind={data.kind} isNaddr={false} />
{/if}
<FooterMenu pubkey={data.pubkey} kind={data.kind} />
