<script lang="ts">
	import '../app.postcss';
	// @ts-ignore
	import { pwaInfo } from 'virtual:pwa-info';
	import { _ } from 'svelte-i18n';
	import {
		computePosition,
		autoUpdate,
		offset,
		shift,
		flip,
		arrow
	} from '@floating-ui/dom';
	import {
		Modal,
		Toast,
		initializeStores,
		storePopup
	} from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
	//最初に一回だけ実行するやつ
	import { setModalStore } from '$lib/stores/store';
	import { setToastStore } from '$lib/stores/store';
	import RegisterSw from '$lib/components/RegisterSW.svelte';
	import { onMount } from 'svelte';
	import { backButton, send_pubhex } from '$lib/stores/settings';
	import { afterNavigate } from '$app/navigation';
	import { RelaysReconnectChallenge } from '$lib/streamEventLists';
	import { init as initNostrLogin } from 'nostr-login';
	import { page } from '$app/stores';

	export let data: import('./$types').LayoutServerData;

	send_pubhex.set(data.send_pubhex);
	let mounted = false;
	initializeStores();
	setModalStore();
	setToastStore();
	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';

	onMount(() => {
		mounted = true;
		initNostrLogin({
			/*options*/
		});
		const backBtn = localStorage.getItem('back');
		//console.log('backButton', backBtn);
		if (backBtn) {
			backButton.set(backBtn === 'true' ?? false);
		}
	});

	// $: location =
	// 	typeof window !== 'undefined' ? window?.location.pathname : undefined;
	// $: {
	// 	if (
	// 		location &&
	// 		typeof window !== 'undefined' &&
	// 		(window as any).goatcounter
	// 	) {
	// 		(window as any).goatcounter.path = location;
	// 		// 他の設定があればここで追加
	// 	}
	// }
	afterNavigate(() => {
		if (typeof window !== 'undefined' && (window as any).goatcounter) {
			//console.log('nabigate');
			(window as any).goatcounter.count({
				path: window?.location.pathname
				// 他の情報があればここで追加
			});
			// (window as any).goatcounter.path = window?.location.pathname;
			// // 他の設定があればここで追加
		}
	});

	async function onVisibilityChange() {
		console.log(document.visibilityState);
		if (document.visibilityState === 'visible') {
			await RelaysReconnectChallenge();
		}
	}
</script>

<title>{$_('main.title')}</title>

<svelte:document on:visibilitychange={onVisibilityChange} />
<svelte:head>
	<title>NostViewstr</title>

	<meta prefix="og: https://ogp.me/ns#" />
	<meta property="og:title" content="NostViewstr（のすとびうあ）" />
	<meta property="og:image" content={`${$page.url.origin}/ogp.png`} />
	<meta
		name="google-site-verification"
		content="HWxV5BReP7P0s1OwtbD_e0NGQTV4d2SlCDLFTCfRe-c"
	/>

	{@html webManifestLink}

	<script
		data-goatcounter="https://mono.goatcounter.com/count"
		async
		src="//gc.zgo.at/count.js"
	></script>
</svelte:head>

{#if mounted && pwaInfo}
	<RegisterSw />
{/if}

<slot />

<Modal />
<Toast class="z-[9999]" />
