<script lang="ts">
	import {
		searchRelays,
		postRelays,
		bookmarkRelays,
		relayEvent
	} from '$lib/stores/relays';
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { LightSwitch, clipboard } from '@skeletonlabs/skeleton';
	import {
		bookmarkEvents,
		identifierList,
		listNum
	} from '$lib/stores/bookmarkEvents';
	import copyIcon from '@material-design-icons/svg/round/content_copy.svg?raw';
	import { nip19 } from 'nostr-tools';
	export let parent: any;
	let editMode: boolean = false;
	function onFormSubmit(): void {
		//if ($modalStore[0].response) $modalStore[0].response(res);

		modalStore.close();
	}
	// Form Data
	let res: {
		value: { title?: string; image?: string; summary?: string };
	} = {
		value: {
			title: $identifierList[$listNum].title,
			image: $identifierList[$listNum].image,
			summary: $identifierList[$listNum].summary
		}
	};
	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
		<article class="body">{$modalStore[0].body ?? '(body missing)'}</article>
		<!-- Enable for debugging: -->

		<div class=" ">
			<label class="label mt-2">
				<span>title</span>
				<input
					class="input p-2"
					type="text"
					disabled={!editMode}
					bind:value={res.value.title}
					placeholder="Books"
				/>
			</label>

			<label class="label mt-2">
				<span>image</span>
				<input
					class="input p-2"
					type="text"
					disabled={!editMode}
					bind:value={res.value.image}
					placeholder="https://example.com/image.webp"
				/>
			</label>
			<img class="max-h-24 m-2" src={res.value.image} alt="" />
			<label class="label mt-2">
				<span>summary</span>
				<textarea
					class="input p-2 max-h-24 overflow-y-auto break-all"
					disabled={!editMode}
					bind:value={res.value.summary}
					placeholder="Recommended Books Collection"
				/>
			</label>
		</div>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
        {#if editMode}<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Save</button>
        {:else}
        <button class="btn variant-filled-secondary" on:click={()=>editMode=!editMode} >Edit</button>
        {/if}
    </footer>
	</div>
{/if}
