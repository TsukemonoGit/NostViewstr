<script lang="ts">
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import Delete from '@material-design-icons/svg/round/delete.svg?raw';
  import type { Placement } from '@floating-ui/dom';


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
    <div class="bg-black dark:bg-white rounded">
    <span class="  fill-warning-300">{@html Delete}</span></div>
  </div>
{:else}
  <div use:popup={popupHover('popupDelete', 'bottom')} class="bg-surface-500  rounded">
    <span class=" fill-warning-500">{@html Delete}</span>
  </div>
{/if}

