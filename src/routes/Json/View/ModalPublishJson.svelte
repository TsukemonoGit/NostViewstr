<script lang="ts">
	import type { TabGroup, ToastSettings } from '@skeletonlabs/skeleton';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { getEventHash, nip19, validateEvent } from 'nostr-tools';
	import copyIcon from '@material-design-icons/svg/round/content_copy.svg?raw';
	import { _ } from 'svelte-i18n';
	import { parseNaddr } from '$lib/nostrFunctions';
	import type { Nostr } from 'nosvelte';
	import { pubkey_viewer } from '$lib/stores/settings';
	import { onMount } from 'svelte';

	export let parent: any;

	let textareaElement: HTMLTextAreaElement;

	// TextAreaが表示されたときにスクロールをトップに設定
	onMount(() => {
		if (textareaElement) {
			textareaElement.scrollTop = 0;
		}
	});

	//スクロールされなかったから書いてたけどブラウザ再起動したら治った
	// function handleScroll(event: { deltaY: any; preventDefault: () => void }) {
	// 	// ここにカスタムのスクロール処理を追加
	// 	// マウスホイールのスクロール量
	// 	const delta = event.deltaY;

	// 	// テキストエリアの現在のスクロール位置
	// 	const currentScrollTop = textareaElement.scrollTop;

	// 	// テキストエリアをスクロール
	// 	textareaElement.scrollTop = currentScrollTop + delta;
	// 	// デフォルトのスクロール動作を抑制
	// 	event.preventDefault();
	// 	//console.log('Mouse wheel scrolled:', event.deltaY);
	// }

	let event: string = JSON.stringify(
		$modalStore[0]?.value?.event,
		undefined,
		4
	);

	// Base Classes
	const cBase = 'card p-4  shadow-xl  break-all';
	const cHeader = 'text-2xl font-bold';
	//$modalStore[0]?.meta.hexKey
	let res: Nostr.Event;
	function onFormSubmit(): void {
		console.log(res);
		if ($modalStore[0].response) $modalStore[0].response(res);
		modalStore.close();
	}

	function onClickButton() {
		try {
			const tmp = JSON.parse(event);

			tmp.pubkey = $pubkey_viewer;
			tmp.created_at = Math.floor(Date.now() / 1000);
			tmp.id = '';
			tmp.sig = '';

			const isValidEvent = validateEvent(tmp);
			if (!isValidEvent) {
				throw new Error();
			}
			res = tmp;
			onFormSubmit();
		} catch (error) {
			const t = {
				message: $_('toast.invalidEvent'),
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
			console.log(error);
		}
	}
</script>

<!-- @component This example creates a simple form modal. -->
{#if $modalStore[0]}
	<div
		class="modal-example-form {cBase} bg-surface-200-700-token w-[90%] max-w-[768px]"
	>
		<header class={cHeader}>
			{$modalStore[0].title ?? '(title missing)'}
		</header>
		<article>{$modalStore[0].body ?? '(title missing)'}</article>
		<!-- <div
			class="bg-surface-50-900-token break-words whitespace-pre-wrap max-h-60 h-auto w-auto overflow-auto break-all max-w-[768px] p-1"
		> -->
		<textarea
			class="input p-2 m-2 my-4 h-60 max-w-[768px] overflow-y-auto break-words whitespace-pre-wrap"
			bind:value={event}
			placeholder=""
			bind:this={textareaElement}
		/>
		<!-- </div> -->

		<footer class="modal-footer {parent.regionFooter} mt-2">
			<!--button-->
			<div class="flex flex-wrap gap-2">
				<!-- <button
					type="button"
					class="btn variant-filled-success p-1"
					on:click={downloadJson}>Download Json</button
				>
				<button
					type="button"
					class="btn variant-filled-secondary p-1"
					on:click={() => onClickButton('note')}>copy noteID</button
				> -->

				<button
					type="button"
					class="btn variant-filled-secondary p-1"
					on:click={() => onClickButton()}>Publish</button
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
