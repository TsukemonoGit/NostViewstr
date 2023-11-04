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
	import { identifierList, listNum } from '$lib/stores/bookmarkEvents';
	import copyIcon from '@material-design-icons/svg/round/content_copy.svg?raw';
	export let parent: any;

	function onFormSubmit(): void {
		//if ($modalStore[0].response) $modalStore[0].response(res);

		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	let copyData: string = 'test';
	let copied = false;
	function onClickHandler(): void {
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 1000);
	}
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
		<article class="body">{$modalStore[0].body ?? '(body missing)'}</article>
		<!-- Enable for debugging: -->
		<div>{$_('nprofile.modal.info.light_switch')}<LightSwitch /></div>
		<!--きょうゆう-->

		list name: {$identifierList[$listNum]}
		<button
			use:clipboard={copyData}
			class="btn variant-filled"
			disabled={copied}
			on:click={onClickHandler}>{copied ? 'Copied 👍' : 'Copy'}</button
		>

		<!--リレーの情報たち-->
		<div class="card p-3">
			<p>{$_('nprofile.modal.info.relay.title')}</p>
			{#if $relayEvent}
				relay from kind:({$relayEvent.kind}) created_at: {new Date(
					$relayEvent.created_at * 1000
				).toLocaleString([], {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit'
				})}
				<p>{$_('nprofile.modal.info.relay.list')}</p>
				<ul
					class="bg-surface-50-900-token card max-h-[4em] overflow-y-auto overflow-x-hidden"
				>
					{#each $bookmarkRelays as relays}
						<li>{relays}</li>
					{/each}
				</ul>

				<p>{$_('nprofile.modal.info.relay.search')}</p>
				<ul class="bg-surface-50-900-token card max-h-[4em] overflow-y-auto">
					{#each $searchRelays as relays}
						<li>{relays}</li>
					{/each}
				</ul>
			{/if}
		</div>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
        <button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Create List</button>
    </footer>
	</div>
{/if}
