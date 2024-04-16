<script lang="ts">
	import type { TabGroup, ToastSettings } from '@skeletonlabs/skeleton';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { _ } from 'svelte-i18n';
	import type { Nostr } from 'nosvelte';
	import { nowProgress, send_pubhex } from '$lib/stores/settings';
	import { sendMessage } from '$lib/streamEventLists';

	export let parent: any;

	// Base Classes
	const cBase = 'card p-4  shadow-xl  break-all w-modal ';
	const cHeader = 'text-2xl font-bold';
	//$modalStore[0]?.meta.hexKey
	const MAX_MESSAGE_LENGTH = 400;
	let inputName: string = '';
	let inputMessage: string = '';
	let error: boolean;

	const handleClickOpen = async () => {
		if (inputMessage.trim() === '') {
			error = true;
			return;
		}
		if (inputName.trim() === '') {
			inputName = 'anonymous';
		}

		if ($nowProgress) {
			return;
		}
		if (inputMessage.trim() === '') {
			return;
		}
		//console.log($send_pubhex);
		//送る
		const mes =
			'[NostViewstr]\nfrom\n' + inputName + '\n\nmessage\n' + inputMessage;
		$nowProgress = true;
		console.log(mes);
		try {
			if ($send_pubhex) {
				await sendMessage(mes, $send_pubhex);
				const toastSettings: ToastSettings = {
					message: `Thank you for reaching out!`,
					timeout: 5000
				};

				toastStore.trigger(toastSettings);
				modalStore.close();

				// Toast settings
			} else {
				throw error;
			}
		} catch (error) {
			// Toast settings
			const toastSettings: ToastSettings = {
				message: `Failed to send your message. Please try again later.`,
				background: 'bg-orange-500 text-white width-filled ',
				timeout: 5000
			};
			toastStore.trigger(toastSettings);
		}
		$nowProgress = false;
	};
</script>

<!-- @component This example creates a simple form modal. -->
{#if $modalStore[0]}
	<div class="modal-example-form {cBase} bg-surface-200-700-token">
		<header class={cHeader}>
			{$modalStore[0].title ?? '(title missing)'}
		</header>

		<div
			class=" break-words whitespace-pre-wrap max-h-72 overflow-auto break-all p-1"
		>
			<div>{$_('feedback.setumei')}</div>
			<label class="label">
				<span>Name (not required)</span>
				<input
					class="input"
					type="text"
					placeholder=""
					bind:value={inputName}
					disabled={$nowProgress}
				/>
			</label>
			<label class="label">
				<span>Message</span>
				<textarea
					class="textarea"
					rows="4"
					placeholder=""
					maxlength="400"
					bind:value={inputMessage}
					disabled={$nowProgress}
				/>
				{#if error}
					<p class="error">
						Message is required and must be less than {MAX_MESSAGE_LENGTH} characters
					</p>
				{/if}
			</label>
		</div>

		<footer class="modal-footer {parent.regionFooter} mt-2">
			<!--button-->
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					class="btn variant-filled-secondary p-1"
					disabled={$nowProgress}
					on:click={handleClickOpen}>Send Feedback</button
				>

				<button
					type="button"
					class="btn variant-filled-surface p-2"
					disabled={$nowProgress}
					on:click={parent.onClose}>{parent.buttonTextCancel}</button
				>
			</div>
		</footer>
	</div>
{/if}
