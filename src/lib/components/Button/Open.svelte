<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { Placement } from '@floating-ui/dom';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';

	import OpenInBrowser from '@material-design-icons/svg/round/open_in_browser.svg?raw';
	import { checkIsPhone } from '$lib/stores/isPhone';

	const popupHover = (target: string, place: Placement): PopupSettings => {
		return {
			event: 'hover',
			target: target,
			placement: place
		};
	};
</script>

{#if checkIsPhone()}
	<span class="fill-white">{@html OpenInBrowser}</span>
{:else}
	<div use:popup={popupHover('popupOpen', 'bottom')}>
		<span class="  fill-white">{@html OpenInBrowser}</span>
	</div>
{/if}
