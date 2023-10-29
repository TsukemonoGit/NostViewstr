<script lang="ts">
	import type { Placement } from '@floating-ui/dom';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import Chat from '@material-design-icons/svg/round/chat.svg?raw';
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
	<span class=" rounded fill-white">{@html Chat}</span>
{:else}
	<div use:popup={popupHover('popupShare', 'top')}>
		<span class=" rounded fill-white">{@html Chat}</span>
	</div>
{/if}
