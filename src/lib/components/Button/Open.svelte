<script lang="ts">
  import type { Placement } from '@floating-ui/dom';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';

  import OpenInBrowser from '@material-design-icons/svg/round/open_in_browser.svg?raw';

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
    <span class="fill-primary-100">{@html OpenInBrowser}</span>
  </div>
{:else}
  <div use:popup={popupHover('popupOpen', 'bottom')}>
    <span class="  fill-primary-100">{@html OpenInBrowser}</span>
  </div>
{/if}
