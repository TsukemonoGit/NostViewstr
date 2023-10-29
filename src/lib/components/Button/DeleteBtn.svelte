<script lang="ts">
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import Delete from '@material-design-icons/svg/round/delete.svg?raw';
	import type { Placement } from '@floating-ui/dom';
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
	<div>
		<span class="  fill-warning-400">{@html Delete}</span>
	</div>
{:else}
	<div use:popup={popupHover('popupDelete', 'bottom')}>
		<span class=" fill-warning-400">{@html Delete}</span>
	</div>
{/if}
