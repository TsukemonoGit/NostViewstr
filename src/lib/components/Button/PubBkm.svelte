<script lang="ts">
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';

	import type { Placement } from '@floating-ui/dom';
	import { checkIsPhone } from '$lib/stores/isPhone';
	import { pubIcon } from '../icons';

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
		{@html pubIcon}
	</div>
{:else}
	<div use:popup={popupHover('popupPub', 'bottom')}>
		{@html pubIcon}
	</div>
{/if}
