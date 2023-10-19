<script lang="ts">
	import type { Placement } from '@floating-ui/dom';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';

	import OpenInBrowser from '@material-design-icons/svg/round/open_in_browser.svg?raw';
	import { isPhone } from '$lib/store';

	const popupHover = (target: string, place: Placement): PopupSettings => {
		return {
			event: 'hover',
			target: target,
			placement: place
		};
	};
</script>

{#if $isPhone}
	<div class="bg-surface-500 rounded">
		<span class="fill-white">{@html OpenInBrowser}</span>
	</div>
{:else}
	<div use:popup={popupHover('popupOpen', 'bottom')} class="bg-surface-500 rounded">
		<span class="  fill-white">{@html OpenInBrowser}</span>
	</div>
{/if}
