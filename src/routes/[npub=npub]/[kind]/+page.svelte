<script lang="ts">
	import { _ } from 'svelte-i18n';

	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';

	import type { PageData } from './$types';
	import { URLPreview, iconView, saveObj } from '$lib/stores/settings';
	import { nip19 } from 'nostr-tools';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	export let data: PageData;
	let saveCheck: boolean;
	// 初回のみ saveCheck を true にする
	let initialized = false;
	$: {
		if (!initialized && $saveObj !== null) {
			saveCheck = true;
			initialized = true;
		}
	}
	onMount(() => {
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
					saveCheck = true;
					$iconView = $saveObj.iconView;
					$URLPreview = $saveObj.URLPreview;
				}
			} catch (error) {}
		}
		if ($saveObj) {
			saveCheck = true;
		}
	});
	function settingFunc() {
		if (saveCheck) {
			const obj = {
				pub: data.pubkey,
				kind: data.kind,
				iconView: $iconView,
				URLPreview: $URLPreview
			};
			localStorage.setItem('info', JSON.stringify(obj));
			$saveObj = obj;
		} else {
			localStorage.removeItem('info');
			$saveObj = null;
		}
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
			<button class="mb-5" on:click={() => goto('/')}
				><h1 class="h1">{$_('main.title')}</h1>
			</button>

			<div class="space-t-5">
				<h5 class="h5">kind:{data.kind}</h5>
				<Settings {settingFunc} bind:saveCheck />
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
