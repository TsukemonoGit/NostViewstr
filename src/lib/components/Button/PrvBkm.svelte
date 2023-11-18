<script lang="ts">
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import type { Placement } from '@floating-ui/dom';
	import { checkIsPhone } from '$lib/stores/isPhone';
	import { prvIcon } from '../icons';

	const popupHover = (target: string, place: Placement): PopupSettings => {
		return {
			event: 'hover',
			target: target,
			placement: place
		};
	};
</script>

{#if checkIsPhone()}
	<div>
		{@html prvIcon}
	</div>
{:else}
	<div use:popup={popupHover('popupPrv', 'bottom')}>
		{@html prvIcon}
	</div>
{/if}
