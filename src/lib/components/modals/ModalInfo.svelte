<script lang="ts">
	import { searchRelays, bookmarkRelays, relayEvent } from '$lib/stores/relays';
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { LightSwitch, SlideToggle, clipboard } from '@skeletonlabs/skeleton';

	import loginIcon from '@material-design-icons/svg/round/login.svg?raw';
	import shareIcon from '@material-design-icons/svg/round/chat.svg?raw';
	import lightningIcon from '@material-design-icons/svg/round/bolt.svg?raw';

	import ArrowCircleRight from '@material-design-icons/svg/round/arrow_circle_right.svg?raw';
	import Delete from '@material-design-icons/svg/round/delete.svg?raw';
	import OpenInBrowser from '@material-design-icons/svg/round/open_in_browser.svg?raw';

	import { getPub } from '$lib/nostrFunctions';
	import {
		URLPreview,
		allView,
		iconView,
		pubkey_viewer
	} from '$lib/stores/settings';
	import githubIcon from '$lib/assets/github-mark.png';
	import githubIconWhite from '$lib/assets/github-mark-white.png';
	import { nostrIcon, prvIcon, pubIcon } from '$lib/components/icons';
	export let parent: any;

	let res: { share: boolean; openJson: boolean } = {
		share: false,
		openJson: false
	};
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
	let toggleValue: boolean = $URLPreview;
	$: if (toggleValue) {
		$URLPreview = true;
		$iconView = true;
	} else {
		$URLPreview = false;
		$iconView = false;
	}
	let warningToggle: boolean = $allView;
	$: $allView = warningToggle;
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>

		<!-- Enable for debugging: -->
		<div class="flex gap-2">{$_('modal.info.light_switch')}<LightSwitch /></div>

		<!--ログインの許可のやつ全スキップした人のためとか-->

		{#if !$pubkey_viewer || $pubkey_viewer === ''}
			<button
				class="btn variant-filled-primary fill-white"
				on:click={onClickLogin}>{@html loginIcon}</button
			>
		{/if}

		<!--iconとかURLとかの表示切替-->
		<div class="flex gap-2">
			{$_('modal.info.urlandIconOff')}
			<SlideToggle size="sm" name="slide" bind:checked={toggleValue} />
			{$_('modal.info.urlandIconOn')}
		</div>

		<!--iconとかURLとかの表示切替-->
		<div class="flex gap-2">
			{$_('modal.info.contentwarning')}
			<SlideToggle size="sm" name="slide" bind:checked={warningToggle} />
		</div>

		<!--まるっと共有-->
		<div class="flex gap-2">
			{$_('modal.info.share')}
			<button
				class="btn-icon btn-icon-sm m-0 p-0 variant-filled-primary fill-white"
				disabled={copied}
				on:click={() => {
					res.share = true;
					onFormSubmit();
				}}>{@html shareIcon}</button
			>
		</div>
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
		<div>
			{$_('modal.info.relay.title')}
			<div class="card p-3">
				{#if $relayEvent}
					<div class="flex gap-3">
						<button
							class=" underline decoration-secondary-400"
							on:click={() => {
								res.openJson = true;
								onFormSubmit();
							}}>kind:{$relayEvent.kind}</button
						>
						{new Date($relayEvent.created_at * 1000).toLocaleString([], {
							year: 'numeric',
							month: '2-digit',
							day: '2-digit',
							hour: '2-digit',
							minute: '2-digit'
						})}
					</div>
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
				<p class="pt-1">{$_('modal.info.relay.list')}</p>
				<ol
					class="bg-surface-50-900-token card max-h-[6em] list overflow-y-auto overflow-x-hidden px-2"
				>
					{#each $bookmarkRelays as relays, index}
						<li>
							<span>{index + 1}.</span><span class="break-all">{relays}</span>
						</li>
					{/each}
				</ol>

				<p class="pt-1">{$_('modal.info.relay.search')}</p>
				<ol
					class="bg-surface-50-900-token card max-h-[6em] list overflow-y-auto px-2"
				>
					{#each $searchRelays as relays, index}
						<li>
							<span>{index + 1}.</span><span class="break-all">{relays}</span>
						</li>
					{/each}
				</ol>
			</div>
		</div>

		<hr />
		<div class="p-0 m-0">{$_('icon_description')}</div>
		<div class="flex flex-wrap">
			<div class="flex gap-1 pr-3">
				<div class="fill-white btn m-0 p-0 mb-1 bg-surface-500 h-fit">
					{@html pubIcon}
				</div>
				{$_('popup.pub')}
			</div>
			<div class="flex gap-1 pr-3">
				<div class="fill-white btn m-0 p-0 mb-1 bg-surface-500 h-fit">
					{@html prvIcon}
				</div>
				{$_('popup.prv')}
			</div>
		</div>
		<div class="flex flex-wrap">
			<div class="flex gap-1 pr-3">
				<div class="fill-white btn m-0 p-0 mb-1 bg-surface-500 h-fit">
					{@html shareIcon}
				</div>
				{$_('popup.Share')}
			</div>
			<div class="flex gap-1 pr-3">
				<div class="fill-white btn m-0 p-0 mb-1 bg-surface-500 h-fit">
					{@html OpenInBrowser}
				</div>
				{$_('popup.open')}
			</div>
			<div class="flex gap-1 pr-3">
				<div class="fill-white btn m-0 p-0 mb-1 bg-surface-500 h-fit">
					{@html ArrowCircleRight}
				</div>
				{$_('popup.move')}
			</div>
			<div class="flex gap-1">
				<div class="fill-warning-400 btn m-0 p-0 mb-1 bg-surface-500 h-fit">
					{@html Delete}
				</div>
				{$_('popup.delete')}
			</div>
		</div>
		<hr />
		<div class="flex gap-3">
			<a
				class="btn p-0 badge-icon w-[24px] h-[24px] variant-filled-surface rounded-full"
				rel="external noreferrer"
				target="_blank"
				href="https://github.com/TsukemonoGit/nostr-bookamrk-viewer5"
			>
				<img
					src={githubIconWhite}
					class=" w-[18px] h-[18px]"
					alt="githubLink"
				/>
			</a>

			<a
				class="btn p-0 badge-icon w-[24px] h-[24px] nostr variant-filled-surface rounded-full"
				rel="external noreferrer"
				target="_blank"
				href="https://nostter.app/mono@tsukemonogit.github.io"
			>
				{@html nostrIcon}
			</a>
			<button
				class="light btn p-0 m-0 w-[24px] h-[24px] badge-icon variant-filled-surface rounded-full"
				data-npub="npub1sjcvg64knxkrt6ev52rywzu9uzqakgy8ehhk8yezxmpewsthst6sw3jqcw"
				data-note-id="note1sgfa7nh4p4k76k23e0vr0k95svg5hp3xqshq6ewd9jaut6hnp7jq8jhpy8"
				data-relays="wss://yabu.me.io,wss://nos.lol,wss://relay-jp.nostr.wirednet.jp,wss://relay.nostr.band"
				>{@html lightningIcon}</button
			> <script src="https://cdn.jsdelivr.net/npm/nostr-zap@0.21.0"></script>
		</div>

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{parent.buttonTextCancel}</button
			>
			<!-- <button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Create List</button>
    -->
		</footer>
	</div>
{/if}

<style>
	:global(.light svg) {
		width: 24px;
		height: 24px;
		fill: yellow;
	}
</style>
