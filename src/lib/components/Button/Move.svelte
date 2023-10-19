<script lang="ts">
  import type { Placement } from '@floating-ui/dom';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import ArrowCircleRight from '@material-design-icons/svg/round/arrow_circle_right.svg?raw';
  import { _ } from 'svelte-i18n'

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
      >{@html ArrowCircleRight}</span
    >
  </div>
{:else}
  <div use:popup={popupHover('popupMove', 'top')}>
    <span class=" rounded fill-primary-100 variant-filled-primary"
      >{@html ArrowCircleRight}</span
    >
  </div>
{/if}

<div class="card p-1 variant-ghost-secondary z-20" data-popup="popupMove">
  <p>{$_('popup.move')}</p>
  <div class="arrow variant-filled-secondary z-20" />
</div>