<script lang="ts">
	import type { Placement } from '@floating-ui/dom';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import Chat from '@material-design-icons/svg/round/chat.svg?raw';
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
		<span class=" rounded fill-white">{@html Chat}</span>
	</div>
{:else}
	<div use:popup={popupHover('popupShare', 'top')} class="bg-surface-500 rounded">
		<span class=" rounded fill-white">{@html Chat}</span>
	</div>
{/if}
