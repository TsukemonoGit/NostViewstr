<!--
  Custom Modal component - Svelte 5 compatible replacement for Skeleton v2's <Modal>.

  Key architectural differences from Skeleton v2:
    - No {#key $modalStore} block (this was the root cause of Svelte 5 crashes)
    - Uses two-phase close: data stays in store during out-transition
    - Child components can safely access $modalStore[0] throughout their lifecycle
-->
<script lang="ts">
	import { modalStore } from '$lib/stores/store';
	import { fade, fly } from 'svelte/transition';

	// Props matching Skeleton v2 Modal API
	export let position = 'items-center';
	export let background = 'bg-surface-100-800-token';
	export let width = 'w-modal';
	export let height = 'h-auto';
	export let padding = 'p-4';
	export let spacing = 'space-y-4';
	export let rounded = 'rounded-container-token';
	export let shadow = 'shadow-xl';
	export let zIndex = 'z-[999]';
	export let buttonNeutral = 'variant-ghost-surface';
	export let buttonPositive = 'variant-filled';
	export let buttonTextCancel = 'Cancel';
	export let buttonTextConfirm = 'Confirm';
	export let buttonTextSubmit = 'Submit';
	export let regionBackdrop = '';
	export let regionHeader = 'text-2xl font-bold';
	export let regionBody = 'max-h-[200px] overflow-hidden';
	export let regionFooter = 'flex justify-end space-x-2';

	// Two-phase close: subscribe to the closing signal
	const closingStore = modalStore._closing;

	// Determine visibility: show when there are modals AND not in closing phase
	$: shouldShow = $modalStore.length > 0 && !$closingStore;

	// Resolve component reference
	$: currentComponent =
		$modalStore.length > 0 && typeof $modalStore[0]?.component === 'object'
			? $modalStore[0].component
			: null;

	// Parent prop passed to child modal components
	$: parent = {
		position,
		background,
		width,
		height,
		padding,
		spacing,
		rounded,
		shadow,
		buttonNeutral,
		buttonPositive,
		buttonTextCancel,
		buttonTextConfirm,
		buttonTextSubmit,
		regionBackdrop,
		regionHeader,
		regionBody,
		regionFooter,
		onClose
	};

	// Prompt value for prompt-type modals
	let promptValue: any = '';
	$: if ($modalStore.length > 0 && $modalStore[0]?.type === 'prompt') {
		promptValue = $modalStore[0].value ?? '';
	}

	// Update button text from modal settings
	const buttonTextDefaults = {
		buttonTextCancel,
		buttonTextConfirm,
		buttonTextSubmit
	};
	$: if ($modalStore.length > 0) {
		buttonTextCancel =
			$modalStore[0]?.buttonTextCancel || buttonTextDefaults.buttonTextCancel;
		buttonTextConfirm =
			$modalStore[0]?.buttonTextConfirm || buttonTextDefaults.buttonTextConfirm;
		buttonTextSubmit =
			$modalStore[0]?.buttonTextSubmit || buttonTextDefaults.buttonTextSubmit;
	}

	// --- Event handlers ---

	function onClose() {
		if ($modalStore[0]?.response) $modalStore[0].response(false);
		modalStore.close();
	}

	function onConfirm() {
		if ($modalStore[0]?.response) $modalStore[0].response(true);
		modalStore.close();
	}

	function onPromptSubmit(event: Event) {
		event.preventDefault();
		if ($modalStore[0]?.response) {
			if (
				$modalStore[0].valueAttr !== undefined &&
				'type' in $modalStore[0].valueAttr &&
				$modalStore[0].valueAttr.type === 'number'
			)
				$modalStore[0].response(parseInt(promptValue));
			else $modalStore[0].response(promptValue);
		}
		modalStore.close();
	}

	function onKeyDown(event: KeyboardEvent) {
		if (!$modalStore.length) return;
		if (event.code === 'Escape') onClose();
	}

	// Backdrop click detection (same pattern as Skeleton v2 - mousedown+mouseup
	// to avoid closing when user drags from inside modal to backdrop)
	let registeredInteractionWithBackdrop = false;

	function onBackdropInteractionBegin(event: MouseEvent | TouchEvent) {
		if (!(event.target instanceof Element)) return;
		const classList = event.target.classList;
		if (
			classList.contains('modal-backdrop') ||
			classList.contains('modal-transition')
		) {
			registeredInteractionWithBackdrop = true;
		}
	}

	function onBackdropInteractionEnd(event: MouseEvent | TouchEvent) {
		if (!(event.target instanceof Element)) return;
		const classList = event.target.classList;
		if (
			(classList.contains('modal-backdrop') ||
				classList.contains('modal-transition')) &&
			registeredInteractionWithBackdrop
		) {
			if ($modalStore[0]?.response) $modalStore[0].response(undefined);
			modalStore.close();
		}
		registeredInteractionWithBackdrop = false;
	}

	// After out-transition completes, commit the actual store removal
	function onOutroEnd() {
		modalStore._commitClose();
	}

	// --- Derived classes ---
	$: cPosition = $modalStore[0]?.position ?? position;
	$: classesBackdrop = `fixed top-0 left-0 right-0 bottom-0 bg-surface-backdrop-token p-4 ${regionBackdrop} ${zIndex} ${$$props.class ?? ''} ${$modalStore[0]?.backdropClasses ?? ''}`;
	$: classesTransitionLayer = `w-full h-fit min-h-full overflow-y-auto flex justify-center ${cPosition ?? ''}`;
	$: classesModal = `block overflow-y-auto ${background} ${width} ${height} ${padding} ${spacing} ${rounded} ${shadow} ${$modalStore[0]?.modalClasses ?? ''}`;
</script>

<svelte:window on:keydown={onKeyDown} />

{#if shouldShow}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="modal-backdrop {classesBackdrop}"
		data-testid="modal-backdrop"
		on:mousedown={onBackdropInteractionBegin}
		on:mouseup={onBackdropInteractionEnd}
		on:touchstart|passive
		on:touchend|passive
		transition:fade|global={{ duration: 150 }}
		on:outroend={onOutroEnd}
	>
		<!-- Transition Layer -->
		<div
			class="modal-transition {classesTransitionLayer}"
			in:fly|global={{ duration: 150, opacity: 0, x: 0, y: 100 }}
			out:fly|global={{ duration: 150, opacity: 0, x: 0, y: 100 }}
		>
			{#if $modalStore[0]?.type !== 'component'}
				<!-- Modal: Presets (alert / confirm / prompt) -->
				<div
					class="modal {classesModal}"
					data-testid="modal"
					role="dialog"
					aria-modal="true"
					aria-label={$modalStore[0]?.title ?? ''}
				>
					{#if $modalStore[0]?.title}
						<header class="modal-header {regionHeader}">
							{@html $modalStore[0].title}
						</header>
					{/if}
					{#if $modalStore[0]?.body}
						<article class="modal-body {regionBody}">
							{@html $modalStore[0].body}
						</article>
					{/if}
					{#if $modalStore[0]?.image && typeof $modalStore[0]?.image === 'string'}
						<img
							class="modal-image w-full h-auto"
							src={$modalStore[0].image}
							alt="Modal"
						/>
					{/if}
					{#if $modalStore[0]?.type === 'alert'}
						<footer class="modal-footer {regionFooter}">
							<button
								type="button"
								class="btn {buttonNeutral}"
								on:click={onClose}>{buttonTextCancel}</button
							>
						</footer>
					{:else if $modalStore[0]?.type === 'confirm'}
						<footer class="modal-footer {regionFooter}">
							<button
								type="button"
								class="btn {buttonNeutral}"
								on:click={onClose}>{buttonTextCancel}</button
							>
							<button
								type="button"
								class="btn {buttonPositive}"
								on:click={onConfirm}>{buttonTextConfirm}</button
							>
						</footer>
					{:else if $modalStore[0]?.type === 'prompt'}
						<form class="space-y-4" on:submit={onPromptSubmit}>
							<input
								class="modal-prompt-input input"
								name="prompt"
								type="text"
								bind:value={promptValue}
							/>
							<footer class="modal-footer {regionFooter}">
								<button
									type="button"
									class="btn {buttonNeutral}"
									on:click={onClose}>{buttonTextCancel}</button
								>
								<button type="submit" class="btn {buttonPositive}"
									>{buttonTextSubmit}</button
								>
							</footer>
						</form>
					{/if}
				</div>
			{:else}
				<!-- Modal: Components -->
				<div
					class="modal contents {$modalStore[0]?.modalClasses ?? ''}"
					data-testid="modal-component"
					role="dialog"
					aria-modal="true"
					aria-label={$modalStore[0]?.title ?? ''}
				>
					{#if currentComponent?.slot}
						<svelte:component
							this={currentComponent.ref}
							{...currentComponent.props}
							{parent}
						>
							{@html currentComponent.slot}
						</svelte:component>
					{:else if currentComponent}
						<svelte:component
							this={currentComponent.ref}
							{...currentComponent.props}
							{parent}
						/>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}
