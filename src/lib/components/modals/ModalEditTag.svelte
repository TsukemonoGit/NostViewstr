<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { bookmarkEvents, identifierList } from '$lib/stores/bookmarkEvents';
	import { modalStore, toastStore } from '$lib/stores/store';

	// Props
	/** Exposes parent props to this component. */
	export let parent: any;
	export let selectedValue: number;

	// Form Data
	let res: {
		btn: string;
		tagIndex: number;
		value: { id: string; title?: string; image?: string; summary?: string };
	} = {
		value: { id: '' },
		btn: '',
		tagIndex: 0
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
			$identifierList.some((item) => item.identifier === res.value.id)
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

	// function clickDeleteButton() {
	//   //ほんとに消すのか出す
	//   const t: ToastSettings = {
	//     message: `Are you sure you delete  tag [${
	//       $bookmarkEvents[res.tagIndex].tags[0][1]
	//     }]?`,
	//     timeout: 10000,
	//     background: 'variant-filled-warning',
	//     action: {
	//       label: 'Delete',

	//       response: async () => {
	//         res.btn = 'delete';
	//         onFormSubmit();
	//       },
	//     },
	//   };

	//   toastStore.trigger(t);
	// }
	let titleInputOpen: boolean = false;
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
		<article class="body">{$modalStore[0].body ?? '(body missing)'}</article>
		<!-- Enable for debugging: -->
		<label class="label">
			<span>ID</span>
			<input
				class="input p-2"
				type="text"
				bind:value={res.value.id}
				placeholder="bookmark"
			/>
		</label>
		{#if !titleInputOpen}
			<button
				on:click={() => {
					titleInputOpen = !titleInputOpen;
				}}
			>
				<div class="btn-icon btn-icon-sm variant-filled-primary">▶</div>
				{$_('modalEditTag.list.title')}
			</button>
		{:else}
			<button
				on:click={() => {
					titleInputOpen = !titleInputOpen;
				}}
			>
				<div class="btn-icon btn-icon-sm variant-filled-primary">▼</div>
				{$_('modalEditTag.list.title')}</button
			>
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
					<span>summary</span>
					<input
						class="input p-2"
						type="text"
						bind:value={res.value.summary}
						placeholder="Recommended Books Collection"
					/>
				</label>
			</div>
		{/if}
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
        <button class="btn {parent.buttonPositive}" on:click={clickAddButton}>Create List</button>
    </footer>

		{#if $identifierList.length > 0}
			<article class="whitespace-pre-wrap break-words">
				{@html $_('ModalEditTag.delete_body')}
			</article>
			<select
				class="select"
				size="1"
				bind:value={selectedValue}
				on:change={handleChange}
			>
				{#each $identifierList as tag, index}
					<option value={index}>{tag.identifier}</option>
				{/each}
			</select>
			<!-- prettier-ignore -->
			<footer class="modal-footer {parent.regionFooter}">
            <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
           
            <button class="btn variant-filled-warning" on:click={ ()=> {res.btn = 'delete';
       onFormSubmit();}}>Delete List</button>
        </footer>
		{/if}
	</div>
{/if}
