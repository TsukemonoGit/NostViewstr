<script lang="ts">
  import { page } from '$app/stores';

  import {
    getModalStore,
    getToastStore,
    type ToastSettings,
  } from '@skeletonlabs/skeleton';
  import { nip19 } from 'nostr-tools';
  export let parent: any;
  const modalStore = getModalStore();
  const toastStore = getToastStore();
  // Base Classes
  const cBase = 'card p-4  shadow-xl space-y-4 break-all';

  //$modalStore[0]?.meta.hexKey
  function onClickButton(str: string) {
    const text =
        str === 'npub'
        ? nip19.npubEncode($modalStore[0]?.meta.metadata.pubkey)
        : $modalStore[0]?.meta.metadata.pubkey;

    navigator.clipboard.writeText(text).then(
      () => {
        // コピーに成功したときの処理
        console.log(`copied: ${text.slice(0, 15)}...`);

        const t: ToastSettings = {
          message: `copied: ${text.slice(0, 15)}...`,
          timeout: 3000,
        };
        toastStore.trigger(t);
      },
      () => {
        // コピーに失敗したときの処理
        console.log('コピー失敗');
        /**@type {import('@skeletonlabs/skeleton').ToastSettings}*/
        const t: ToastSettings = {
          message: 'failed to copy',
          timeout: 3000,
          background: 'bg-orange-500 text-white width-filled ',
        };
        toastStore.trigger(t);
      },
    );

    parent.onClose();
  }
</script>

<!-- @component This example creates a simple form modal. -->
{#if $modalStore[0]}
  <div class=" modal-example-form {cBase} ">
    <!--profile-->

    <div class="grid grid-row-[auto_auto_auto] gap-1 max-w-md">
      <div class="grid grid-cols-[auto_1fr] gap-2 max-w-md">
        <div
          class="w-16 h-16 rounded-lg flex justify-center overflow-hidden bg-surface-500/25"
        >
          {#if JSON.parse($modalStore[0].meta.metadata.content).picture}
            <img
              class="w-16 object-contain justify-center"
              src={JSON.parse($modalStore[0].meta.metadata.content).picture}
              alt="avatar"
            />
          {/if}
        </div>
        <div>
          <img
            class=""
            src={JSON.parse($modalStore[0].meta.metadata.content).banner}
            alt=""
          />
        </div>
      </div>
      <div class="rounded-sm border-4 border-dotted border-surface-300 p-1">
        <div class="font-bold">about</div>
        <div
          class="break-all whitespace-pre-wrap text-sm max-h-32 overflow-auto"
        >
          {JSON.parse($modalStore[0].meta.metadata.content).about}
        </div>
      </div>
      <div class="rounded-sm border-4 border-dotted border-surface-300 p-1">
        <div class="font-bold">profileJSON</div>
        <div
          class="break-all whitespace-pre-wrap text-sm max-h-24 overflow-auto"
        >
          {JSON.stringify($modalStore[0].meta.metadata, undefined, 4)}
        </div>
      </div>
    </div>

    <!--button-->
    <div class="grid grid-cols-[auto_auto] gap-2">
      <div class="grid grid-row-[auto_auto] gap-2">
        <button
          type="button"
          class="btn variant-filled-secondary p-1"
          on:click={() => onClickButton('npub')}>copy pubKey</button
        >

        <button
          type="button"
          class="btn variant-filled-secondary p-1"
          on:click={() => onClickButton('hex')}>copy hexKey</button
        >
      </div>
      <div class="grid grid-row-[auto_auto] gap-2">
        <button
          type="button"
          class="btn variant-filled-surface p-2"
          on:click={() => {
            window.open(
              'https://nostr.com/' +
                nip19.npubEncode($modalStore[0]?.meta.metadata.pubkey),
              '_blank',
            );
            parent.onClose();
          }}>Open in external app</button
        >

        <button
          type="button"
          class="btn variant-filled-surface p-2"
          on:click={parent.onClose}>{parent.buttonTextCancel}</button
        >
      </div>
    </div>
  </div>
{/if}

<style>
  .banner {
    min-width: 6em;
    max-width: 100px;
  }
  .profile {
    text-shadow: 1px 1px 2px lightgray, -1px -1px 2px lightgray;
  }
</style>
