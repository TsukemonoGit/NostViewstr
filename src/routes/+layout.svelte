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
	import {
		backButton,
		login,
		saveObj,
		send_pubhex
	} from '$lib/stores/settings';
	import { afterNavigate } from '$app/navigation';
	import { RelaysReconnectChallenge } from '$lib/streamEventLists';

	import { page } from '$app/stores';

	export let data: import('./$types').LayoutServerData;

	send_pubhex.set(data.send_pubhex);
	let mounted = false;
	initializeStores();
	setModalStore();
	setToastStore();
	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';
	let NostrLogin;
	onMount(async () => {
		mounted = true;
		NostrLogin = await import('nostr-login');
		NostrLogin.init({
			/*options*/
			noBanner: true
		});
		// if (!$login) {
		// 	document.dispatchEvent(
		// 		new CustomEvent('nlLaunch', { detail: 'welcome' })
		// 	);
		// 	$login = true;
		// 	console.log($login);
		// }
		const backBtn = localStorage.getItem('back');
		//console.log('backButton', backBtn);
		if (backBtn) {
			backButton.set(backBtn === 'true' ?? false);
		}
		const saveInfo = localStorage.getItem('info');

		if (saveInfo) {
			saveObj.set(JSON.parse(saveInfo));
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
		console.log(document?.visibilityState);
		if (document?.visibilityState === 'visible') {
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

	<script lang="ts">
		const theme = localStorage.getItem('theme') ?? 'system';
		console.log('[theme]', theme);
		if (
			theme === 'dark' ||
			(theme === 'system' &&
				window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			document.documentElement.classList.add('dark');
		}

		const color = getComputedStyle(document.documentElement).getPropertyValue(
			'--background'
		);
		let themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
		themeColorMetaTag.content = color;
	</script>
</svelte:head>

{#if mounted && pwaInfo}
	<RegisterSw />
{/if}

<slot />

<Modal class="top-0" />
<Toast class="z-[9999]" />
