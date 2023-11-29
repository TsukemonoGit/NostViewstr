<script lang="ts">
	import { _ } from 'svelte-i18n';

	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';

	import type { PageData } from './$types';

	import FooterMenu from '$lib/components/FooterMenu.svelte';
	import { URLPreview } from '$lib/stores/settings';

	export let data: PageData;

	console.log('PageData', data.pubkey);
	//let settings: boolean = false;
	function settingFunc() {
		//	settings = true;
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

<!-- <div class="break-all">
	<p>npub:{$page.params.npub}</p>
	<p>read:{$searchRelays}</p>
	<p>write:{$postRelays}</p>
	<p>kind:?</p>
</div> -->

{#if $URLPreview === undefined}
	<div class="container h-full mx-auto flex justify-center items-center">
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
		bind:kind={data.kind}
		isNaddr={false}
	/>
	<FooterMenu bind:pubkey={data.pubkey} bind:kind={data.kind} />
{/if}
