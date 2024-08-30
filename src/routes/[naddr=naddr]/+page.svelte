<script lang="ts">
	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import { _ } from 'svelte-i18n';
	import type { PageData } from './$types';

	import { nip19 } from 'nostr-tools';
	import { URLPreview, iconView, saveObj } from '$lib/stores/settings';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	export let data: PageData;
	const kind = data.kind;
	const identifier = data.identifier;
	let settings: boolean = false;

	onMount(async () => {
		if ($iconView === undefined) {
			try {
				if (!$saveObj) {
					const saveInfo = localStorage.getItem('info');
					if (!saveInfo) {
						return;
					}
					$saveObj = JSON.parse(saveInfo);
				}
				if ($saveObj) {
					$iconView = $saveObj.iconView;
					$URLPreview = $saveObj.URLPreview;
				}
			} catch (error) {}
		}
	});
	async function settingFunc() {
		settings = true;
	}
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
			<button class="mb-5" on:click={() => goto('/')}
				><h1 class="h1">{$_('main.title')}</h1>
			</button>

			<div class="space-t-5">
				kind:{data.kind}
				<Settings {settingFunc} saveCheck={false} noSave={true} />
			</div>
		</div>
	</div>
{:else}
	<ListedEventList
		bind:pubkey={data.pubkey}
		{kind}
		identifier={identifier === '' ? undefined : identifier}
		isNaddr={true}
	/>
{/if}
