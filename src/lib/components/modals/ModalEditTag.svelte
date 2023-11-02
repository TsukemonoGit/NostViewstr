<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { bookmarkEvents, identifierList } from '$lib/stores/bookmarkEvents';
	import { modalStore, toastStore } from '$lib/stores/store';
	// Props
	/** Exposes parent props to this component. */
	export let parent: any;
	export let selectedValue: number;

	// Stores
	import { TabGroup, type ToastSettings } from '@skeletonlabs/skeleton';

	// Form Data
	let res = {
		value: '',
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
		res.value = res.value.trim();
		console.log(res.value.length);
		//有効なタグ名かチェック
		if (res.value === '') {
			const t = {
				message: 'タグ名を入力してください',
				timeout: 3000,
				background: 'variant-filled-error'
			};

			toastStore.trigger(t);
		} else if (res.value.length > 30) {
			const t = {
				message: 'タグ名が長すぎます',
				timeout: 3000,
				background: 'variant-filled-error'
			};

			toastStore.trigger(t);
		} else if ($identifierList.some((item) => item === res.value)) {
			const t = {
				message: '同じ名前のタグが既に存在します',
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
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
		<article class="body">{$modalStore[0].body ?? '(body missing)'}</article>
		<!-- Enable for debugging: -->

		<input
			class="input p-2"
			type="text"
			bind:value={res.value}
			placeholder="bookmark"
		/>

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
					<option value={index}>{tag}</option>
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
