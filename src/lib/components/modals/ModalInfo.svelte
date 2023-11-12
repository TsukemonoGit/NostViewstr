<script lang="ts">
	import { searchRelays, bookmarkRelays, relayEvent } from '$lib/stores/relays';
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { LightSwitch, clipboard } from '@skeletonlabs/skeleton';

	import copyIcon from '@material-design-icons/svg/round/content_copy.svg?raw';
	import loginIcon from '@material-design-icons/svg/round/login.svg?raw';
	import shareIcon from '@material-design-icons/svg/round/share.svg?raw';
	import lightningIcon from '@material-design-icons/svg/round/bolt.svg?raw';

	import { getPub } from '$lib/nostrFunctions';
	import { pubkey_viewer } from '$lib/stores/settings';
	import githubIcon from '$lib/assets/github-mark.png';
	import { nostrIcon } from '$lib/components/icons';
	export let parent: any;

	let res: { share: boolean } = { share: false };
	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response(res);

		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	//	let copyData: string = 'test';
	let copied = false;
	// const adata: nip19.AddressPointer = {
	// 	identifier: $identifierList[$listNum]?.identifier ?? '',
	// 	pubkey: $bookmarkEvents[$listNum].pubkey,
	// 	kind: $bookmarkEvents[$listNum].kind,
	// 	relays: $bookmarkRelays
	// };
	// copyData = nip19.naddrEncode(adata);
	// function onClickHandler(): void {
	// 	console.log(copyData);
	// 	copied = true;
	// 	setTimeout(() => {
	// 		copied = false;
	// 	}, 1000);
	// }

	async function onClickLogin() {
		try {
			const res = await getPub();
			if (res !== '') {
				$pubkey_viewer = res;
			}
		} catch (error) {
			console.log('failed to login');
		}
	}
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
		<article class="body">{$modalStore[0].body ?? '(body missing)'}</article>
		<!-- Enable for debugging: -->
		<div>{$_('modal.info.light_switch')}<LightSwitch /></div>
		<!--ログインの許可のやつ全スキップした人のためとか-->
		{#if !$pubkey_viewer || $pubkey_viewer === ''}
			<button
				class="btn variant-filled-primary fill-white"
				on:click={onClickLogin}>{@html loginIcon}</button
			>
		{/if}

		<!--まるっと共有-->
		{$_('modal.info.share')}
		<button
			class="btn-icon variant-filled fill-white"
			disabled={copied}
			on:click={() => {
				res.share = true;
				onFormSubmit();
			}}>{@html shareIcon}</button
		>
		<!--きょうゆう-->
		<!-- <div>
			list name: {$identifierList[$listNum].identifier}
			<button
				use:clipboard={copyData}
				class="btn variant-filled"
				disabled={copied}
				on:click={onClickHandler}>{copied ? 'Copied 👍' : 'Copy'}</button
			>
		</div> -->
		<!--リレーの情報たち-->
		<div class="card p-3">
			<p>{$_('modal.info.relay.title')}</p>
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
				<!-- {:else}
				relay from kind:({$relayEvent.kind}) created_at: {new Date(
					$relayEvent.created_at * 1000
				).toLocaleString([], {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit'
				})} -->
			{/if}
			<p>{$_('modal.info.relay.list')}</p>
			<ul
				class="bg-surface-50-900-token card max-h-[4em] overflow-y-auto overflow-x-hidden"
			>
				{#each $bookmarkRelays as relays}
					<li>{relays}</li>
				{/each}
			</ul>

			<p>{$_('modal.info.relay.search')}</p>
			<ul class="bg-surface-50-900-token card max-h-[4em] overflow-y-auto">
				{#each $searchRelays as relays}
					<li>{relays}</li>
				{/each}
			</ul>
		</div>
		<hr />

		<div class="flex gap-3">
			<a
				class="btn p-0 badge-icon w-6"
				rel="external noreferrer"
				target="_blank"
				href="https://github.com/TsukemonoGit/nostr-bookamrk-viewer5"
			>
				<img src={githubIcon} alt="githubLink" />
			</a>

			<a
				class="btn p-0 badge-icon w-6 nostr h-full"
				rel="external noreferrer"
				target="_blank"
				href="https://nostter.vercel.app/mono@tsukemonogit.github.io"
			>
				{@html nostrIcon}
			</a>
			<button
				class="light btn p-0 m-0 w-[24px] h-[24px] badge-icon rounded-full"
				data-npub="npub1sjcvg64knxkrt6ev52rywzu9uzqakgy8ehhk8yezxmpewsthst6sw3jqcw"
				data-note-id="note1sgfa7nh4p4k76k23e0vr0k95svg5hp3xqshq6ewd9jaut6hnp7jq8jhpy8"
				data-relays="wss://yabu.me.io,wss://nos.lol,wss://relay-jp.nostr.wirednet.jp,wss://relay.nostr.band"
				>{@html lightningIcon}</button
			> <script src="https://cdn.jsdelivr.net/npm/nostr-zap@0.21.0"></script>
		</div>

		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
        <!-- <button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Create List</button>
    --></footer>
	</div>
{/if}

<style>
	:global(.light svg) {
		width: 24px;
		height: 24px;
		fill: rgb(230, 187, 0);
	}
</style>
