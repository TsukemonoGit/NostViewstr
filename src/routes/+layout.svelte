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
	import { backButton } from '$lib/stores/settings';

	let mounted = false;
	initializeStores();
	setModalStore();
	setToastStore();
	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';

	onMount(() => {
		mounted = true;
		const backBtn = localStorage.getItem('back');
		console.log('backButton', backBtn);
		if (backBtn) {
			backButton.set(backBtn === 'true' ?? false);
		}
	});
</script>

<title>{$_('main.title')}</title>
<svelte:head>
	{@html webManifestLink}

	<!-- Google tag (gtag.js) -->

	<!-- <script
		async
		src="https://www.googletagmanager.com/gtag/js?id=G-Y4HDVYX0Z6"
	></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag('js', new Date());
		gtag('config', 'G-Y4HDVYX0Z6', {
			ad_storage: 'denied',
			analytics_storage: 'denied'
		});
	</script> -->
</svelte:head>

{#if mounted && pwaInfo}
	<RegisterSw />
{/if}

<slot />

<Modal />
<Toast class="z-[9999]" />
