<script lang="ts">
	import { _ } from 'svelte-i18n';

	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';

	import type { PageData } from './$types';

	import FooterMenu from '$lib/components/FooterMenu.svelte';
	import { URLPreview } from '$lib/stores/settings';
	import { nip19 } from 'nostr-tools';

	export let data: PageData;

	console.log('PageData', data.pubkey);
	//let settings: boolean = false;
	function settingFunc() {
		//	settings = true;
	}
</script>

<svelte:head>
	<meta
		name="description"
		content="nostr kind:{data.kind}
pubkey:{nip19.npubEncode(data.pubkey)}"
	/>

	<meta
		property="og:description"
		content="kind:{data.kind}
pubkey:{nip19.npubEncode(data.pubkey)}"
	/>
</svelte:head>

{#if $URLPreview === undefined}
	<div
		class="container max-w-[1024px] h-full mx-auto flex justify-center items-center p-4"
	>
		<div class="mt-5">
			<h1 class="h1 mb-5">{$_('main.title')}</h1>

			<div class="space-t-5">
				<h5 class="h5">kind:{data.kind}</h5>
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
	<!-- <FooterMenu bind:pubkey={data.pubkey} bind:kind={data.kind} /> -->
{/if}
