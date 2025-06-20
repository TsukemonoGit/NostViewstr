<script lang="ts">
	import { _ } from 'svelte-i18n';
	import {
		identifierKeysArray,
		identifierListsMap
	} from '$lib/stores/bookmarkEvents';
	import { modalStore, toastStore } from '$lib/stores/store';
	import editIcon from '@material-design-icons/svg/round/edit.svg?raw';
	import deleteIcon from '@material-design-icons/svg/round/delete.svg?raw';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	// Props
	/** Exposes parent props to this component. */
	export let parent: any;
	export let selectedValue: number;

	$: pubkey = $modalStore[0]?.value?.pubkey;
	$: kind = $modalStore[0]?.value?.kind as number;

	// Form Data
	let res: {
		btn: string;
		tagIndex: number;
		value: { id: string; title?: string; image?: string; description?: string };
		kind5?: boolean;
	} = {
		value: { id: '' },
		btn: '',
		tagIndex: 0,
		kind5: false
	};

	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit(): void {
		if (res.tagIndex === undefined) {
			res.tagIndex = 0;
		}
		if ($modalStore[0].response) $modalStore[0].response(res);

		modalStore.close();
	}

	function handleChange() {
		console.log(selectedValue);
		res.tagIndex = selectedValue;
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	// const cForm =
	//   'border border-surface-500 p-4 space-y-4 rounded-container-token';

	function clickAddButton() {
		// Trim the input value to remove leading and trailing spaces
		res.value.id = res.value.id.trim();
		console.log(res.value.id.length);
		//有効なタグ名かチェック
		if (res.value.id === '') {
			const t = {
				message: 'enter a list name',
				timeout: 3000,
				background: 'variant-filled-error'
			};

			toastStore.trigger(t);
		} else if (res.value.id.length > 30) {
			const t = {
				message: 'list name is too long',
				timeout: 3000,
				background: 'variant-filled-error'
			};

			toastStore.trigger(t);
		} else if (
			$identifierKeysArray.some((item: string) => item === res.value.id)
		) {
			const t = {
				message: 'already exists',
				timeout: 3000,
				background: 'variant-filled-error'
			};

			toastStore.trigger(t);
		} else {
			// 有効なタグ名の処理
			res.btn = 'add';
			onFormSubmit();
		}
	}

	let kind5button: boolean = false;
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>

		<Accordion autocollapse>
			<AccordionItem open>
				<svelte:fragment slot="lead"
					><div class="dark:fill-white">{@html editIcon}</div></svelte:fragment
				>
				<svelte:fragment slot="summary"
					>{$_('modal.editTags.body')}</svelte:fragment
				>
				<svelte:fragment slot="content">
					<div class="card p-4">
						<!-- Enable for debugging: -->
						<label class="label">
							<span>ID{$_('modalEditTag.list.ID')}</span>
							<input
								class="input p-2"
								type="text"
								bind:value={res.value.id}
								on:input={() =>
									(res.value.id = res.value.id.replace(/[^a-zA-Z0-9-_]/g, ''))}
								placeholder="bookmark"
							/>
						</label>
						{#if $modalStore[0].value.kind === 30003}
							<div class="mt-4">{$_('modalEditTag.list.title')}</div>
							<div class=" card p-4">
								<label class="label">
									<span>title</span>
									<input
										class="input p-2"
										type="text"
										bind:value={res.value.title}
										placeholder="Books"
									/>
								</label>

								<label class="label">
									<span>image</span>
									<input
										class="input p-2"
										type="text"
										bind:value={res.value.image}
										placeholder="https://example.com/image.webp"
									/>
								</label>

								<label class="label">
									<span>description</span>
									<input
										class="input p-2"
										type="text"
										bind:value={res.value.description}
										placeholder="Recommended Books Collection"
									/>
								</label>
							</div>
						{/if}
						<footer class="modal-footer {parent.regionFooter} pt-1">
							<button
								class="btn {parent.buttonNeutral}"
								on:click={parent.onClose}>{parent.buttonTextCancel}</button
							>
							<button
								class="btn {parent.buttonPositive}"
								on:click={clickAddButton}>Create List</button
							>
						</footer>
					</div>
				</svelte:fragment>
			</AccordionItem>

			<AccordionItem>
				<svelte:fragment slot="lead"
					><div class="dark:fill-white">
						{@html deleteIcon}
					</div></svelte:fragment
				>
				<svelte:fragment slot="summary"
					>{$_('ModalEditTag.delete_body')}</svelte:fragment
				>
				<svelte:fragment slot="content">
					<div class="card p-4">
						{#if $identifierListsMap[pubkey] && $identifierListsMap[pubkey][kind].size > 0}
							<select
								class="select mb-4"
								size="1"
								bind:value={selectedValue}
								on:change={handleChange}
							>
								{#each $identifierKeysArray as tag, index}
									<option value={index}
										>{$identifierListsMap[pubkey][kind].get(tag)
											?.identifier}</option
									>
								{/each}
							</select>

							<footer class="modal-footer {parent.regionFooter}">
								<button
									class="btn {parent.buttonNeutral}"
									on:click={parent.onClose}>{parent.buttonTextCancel}</button
								>

								<button
									class="btn variant-filled-warning"
									on:click={() => {
										res.btn = 'delete';
										res.kind5 = false;
										onFormSubmit();
									}}>Delete List</button
								>
							</footer>
							<button
								class="btn"
								on:click={() => {
									kind5button = !kind5button;
								}}>{kind5button ? '▼' : '▶'} Delete using kind:5</button
							>
							{#if kind5button}
								<p>{$_('modal.editTags.kind')}</p>
								<p>{$_('modal.editTags.kindexp')}</p>
								<button
									class="btn variant-filled-warning"
									on:click={() => {
										res.btn = 'delete';
										res.kind5 = true;
										onFormSubmit();
									}}>kind5 delete</button
								>
							{/if}
						{:else}no lists{/if}
					</div>
				</svelte:fragment>
			</AccordionItem>
		</Accordion>
	</div>
{/if}
