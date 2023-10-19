<script lang="ts">
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
  const cHeader = 'text-2xl font-bold';
  //$modalStore[0]?.meta.hexKey

  function onClickButton(str: string) {
    const text =
      str === 'note'
        ? nip19.noteEncode($modalStore[0]?.meta.note.id)
        : $modalStore[0]?.meta.note.id;

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
  <div class="modal-example-form {cBase} bg-surface-200-700-token">
    <header class={cHeader}>
      {$modalStore[0].title ?? '(title missing)'}
    </header>

    <div
      class="bg-surface-50-900-token break-words whitespace-pre-wrap max-h-60 overflow-auto"
    >
      {JSON.stringify($modalStore[0].meta.note, undefined, 4)}
    </div>
    <footer class="modal-footer {parent.regionFooter}">
      <!--button-->
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="btn variant-filled-secondary p-1"
          on:click={() => onClickButton('note')}>copy noteID</button
        >

        <button
          type="button"
          class="btn variant-filled-secondary p-1"
          on:click={() => onClickButton('hex')}>copy hexID</button
        >

        <button
          type="button"
          class="btn variant-filled-surface p-2"
          on:click={parent.onClose}>{parent.buttonTextCancel}</button
        >
      </div>
    </footer>
  </div>
{/if}
