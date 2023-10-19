<script lang="ts">
  import type { Placement } from '@floating-ui/dom';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import Chat from '@material-design-icons/svg/round/chat.svg?raw';


  export let isSmph: boolean;

  const popupHover = (target: string, place: Placement): PopupSettings => {
    return {
      event: 'hover',
      target: target,
      placement: place,
    };
  };
</script>

{#if isSmph}
  <div>
    <span class=" rounded fill-primary-100 variant-filled-primary"
      >{@html Chat}</span
    >
  </div>
{:else}
  <div use:popup={popupHover('popupShare', 'top')} class="bg-surface-500  rounded">
    <span class=" rounded fill-primary-100 variant-filled-primary"
      >{@html Chat}</span
    >
  </div>
{/if}
