<script lang="ts">
	import '../app.postcss';
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

	let mounted = false;
	initializeStores();
	setModalStore();
	setToastStore();
	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';

	onMount(() => {
		mounted = true;
	});
</script>

<title>{$_('main.title')}</title>
<svelte:head>
	{@html webManifestLink}
</svelte:head>

{#if mounted && pwaInfo}
	<RegisterSw />
{/if}

<slot />

<Modal />
<Toast class="z-[9999]" />
