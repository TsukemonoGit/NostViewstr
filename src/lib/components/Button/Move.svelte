<script lang="ts">
	import type { Placement } from '@floating-ui/dom';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import ArrowCircleRight from '@material-design-icons/svg/round/arrow_circle_right.svg?raw';
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
	<span class=" rounded fill-white">{@html ArrowCircleRight}</span>
{:else}
	<div use:popup={popupHover('popupMove', 'top')}>
		<span class=" rounded fill-white">{@html ArrowCircleRight}</span>
	</div>
{/if}
