<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';
	// Props
	/** Exposes parent props to this component. */
	export let parent: any;

	// Stores
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	enum AddTyle {
		Id = 'id',
		Tag = 'tag'
	}
	// Form Data
	const res = {
		value: '',
		btn: 'pub',
		create: false,
		type: AddTyle.Id,
		tagvalue: ''
	};

	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response(res);
		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	//const cForm =
	//  'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<Accordion autocollapse>
			<AccordionItem open>
				<svelte:fragment slot="lead">🗒</svelte:fragment>
				<svelte:fragment slot="summary"
					>{$_('ModalAddNote.add_note')}</svelte:fragment
				>
				<svelte:fragment slot="content">
					<div class="card p-4">
						<header class={cHeader}>
							🗒 {$_('ModalAddNote.add_note_to1')}{$modalStore[0].title ??
								'(title missing)'}{$_('ModalAddNote.add_note_to2')}
						</header>
						<article class="body">
							{$modalStore[0].body ?? '(body missing)'}
						</article>
						<!-- Enable for debugging: -->

						<input
							class="input p-2 m-2"
							type="text"
							bind:value={res.value}
							placeholder="note..."
						/>

						<footer class=" gap-2 flex flex-wrap justify-end mt-2">
							<button
								class="btn variant-filled-warning {parent.buttonPositive}"
								on:click={() => {
									res.type = AddTyle.Id;
									res.btn = 'prv';
									onFormSubmit();
								}}>Private</button
							>
							<button
								class="btn {parent.buttonPositive}"
								on:click={() => {
									res.type = AddTyle.Id;
									res.btn = 'pub';
									onFormSubmit();
								}}>Public</button
							>
						</footer>
					</div>
				</svelte:fragment>
			</AccordionItem>

			<AccordionItem>
				<svelte:fragment slot="lead">🗒</svelte:fragment>
				<svelte:fragment slot="summary"
					>{$_('ModalAddNote.add_note')}
					{$_('ModalAddNote.add_note_tag')}</svelte:fragment
				>
				<svelte:fragment slot="content">
					<div class="card p-4">
						<header class={cHeader}>
							🗒 {$_('ModalAddNote.add_note_to1')}{$modalStore[0].title ??
								'(title missing)'}{$_('ModalAddNote.add_note_to2')}
							{$_('ModalAddNote.add_note_tag')}
						</header>
						<article class="body break-all">
							{$_('ModalAddNote.example')}1 ["emoji" ,"wayo",
							"https://example.com/example.png"]<br />
							{$_('ModalAddNote.example')}2 [ "a",
							"30030:84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5:mono"
							]<br />
							<!-- <span class="text-warning-500"
								>{$_('ModalAddNote.caution')}
							</span> -->
						</article>
						<!-- Enable for debugging: -->

						<input
							class="input p-2 m-2"
							type="text"
							bind:value={res.tagvalue}
							placeholder="[”e”,”1234”]"
						/>

						<footer class=" rid grid-cols-3 gap-2 flex justify-end mt-2">
							<button
								class="btn variant-filled-warning {parent.buttonPositive}"
								on:click={() => {
									res.type = AddTyle.Tag;
									res.btn = 'prv';
									onFormSubmit();
								}}>Private</button
							>
							<button
								class="btn {parent.buttonPositive}"
								on:click={() => {
									res.type = AddTyle.Tag;
									res.btn = 'pub';
									onFormSubmit();
								}}>Public</button
							>
						</footer>
					</div>
				</svelte:fragment>
			</AccordionItem>
			{#if $modalStore[0].value.kind === 30003 || $modalStore[0].value.kind === 10003}
				<AccordionItem>
					<svelte:fragment slot="lead">🖊</svelte:fragment>
					<svelte:fragment slot="summary"
						>{$_('ModalAddNote.create')}
					</svelte:fragment>
					<svelte:fragment slot="content">
						<div class="card p-4">
							<header class={cHeader}>
								🖊 {$_('ModalAddNote.create_to1')}{$modalStore[0].title ??
									'(title missing)'}{$_('ModalAddNote.create_to2')}
							</header>
							<article class="body">{$_('ModalAddNote.create_body')}</article>
							<!-- Enable for debugging: -->

							<textarea
								class="textarea p-2 m-2"
								rows="4"
								bind:value={res.value}
								placeholder="memo..."
							/>

							<footer class=" rid grid-cols-3 gap-2 flex justify-end mt-2">
								<button
									class="btn variant-filled-warning {parent.buttonPositive}"
									on:click={() => {
										if (res.value == '') {
											return;
										}
										res.btn = 'prv';
										res.create = true;
										onFormSubmit();
									}}>Private</button
								>
								<button
									class="btn {parent.buttonPositive}"
									on:click={() => {
										if (res.value == '') {
											return;
										}
										res.btn = 'pub';
										res.create = true;
										onFormSubmit();
									}}>Public</button
								>
							</footer>
						</div>
					</svelte:fragment>
				</AccordionItem>
			{/if}
		</Accordion>
		<footer class=" flex justify-end mt-2 mr-5">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>
				{parent.buttonTextCancel}
			</button>
		</footer>
	</div>
{/if}
