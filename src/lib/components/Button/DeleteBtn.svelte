<script lang="ts">
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import Delete from '@material-design-icons/svg/round/delete.svg?raw';
	import type { Placement } from '@floating-ui/dom';
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
	<div>
		<div class="bg-surface-500 rounded">
			<span class="  fill-warning-400">{@html Delete}</span>
		</div>
	</div>
{:else}
	<div use:popup={popupHover('popupDelete', 'bottom')} class="bg-surface-500 rounded">
		<span class=" fill-warning-400">{@html Delete}</span>
	</div>
{/if}
