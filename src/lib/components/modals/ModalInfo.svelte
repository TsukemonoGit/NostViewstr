<script lang="ts">
	import { relaySet, type RelayConfig } from '$lib/stores/relays';
	import { _ } from 'svelte-i18n';
	import { modalStore } from '$lib/stores/store';
	import { LightSwitch, SlideToggle } from '@skeletonlabs/skeleton';

	import loginIcon from '@material-design-icons/svg/round/login.svg?raw';
	import shareIcon from '@material-design-icons/svg/round/chat.svg?raw';
	import lightningIcon from '@material-design-icons/svg/round/bolt.svg?raw';

	import ArrowCircleRight from '@material-design-icons/svg/round/arrow_circle_right.svg?raw';
	import Delete from '@material-design-icons/svg/round/delete.svg?raw';
	import OpenInBrowser from '@material-design-icons/svg/round/open_in_browser.svg?raw';
	import LeftIcon from '@material-design-icons/svg/round/west.svg?raw';
	import RightIcon from '@material-design-icons/svg/round/east.svg?raw';
	import HomeIcon from '@material-design-icons/svg/round/home.svg?raw';
	import LocationHomeIcon from '@material-design-icons/svg/round/person.svg?raw';
	import ViewIcon from '@material-design-icons/svg/round/expand_less.svg?raw';
	import HideIcon from '@material-design-icons/svg/round/expand_more.svg?raw';
	import { getPub } from '$lib/nostrFunctions';
	import {
		URLPreview,
		allView,
		backButton,
		iconView,
		pubkey_viewer
	} from '$lib/stores/settings';

	import githubIconWhite from '$lib/assets/github-mark-white.png';
	import { nostrIcon, prvIcon, pubIcon } from '$lib/components/icons';
	import { goto } from '$app/navigation';
	import { kinds } from '$lib/kind';
	import { nip19 } from 'nostr-tools';
	import type { Nostr } from 'nosvelte';

	export let parent: any;

	let res: {
		share: boolean;
		shareNaddr: boolean;
		openJson: boolean;
		openMyJson: boolean;
	} = {
		share: false,
		shareNaddr: false,
		openJson: false,
		openMyJson: false
	};
	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response(res);

		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4 my-2';
	const cHeader = 'text-2xl font-bold';
	//	let copyData: string = 'test';
	//let copied = false;

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

	let viewRelays: boolean = false;
	let selectValue: string = Object.keys(kinds)[0];

	function gotoMyList() {
		console.log($pubkey_viewer);
		console.log(`/${nip19.npubEncode($pubkey_viewer)}/${selectValue}`);
		goto(`/${nip19.npubEncode($pubkey_viewer)}/${selectValue}`);

		modalStore.close();
	}
	$: eventTime = $relaySet[$pubkey_viewer]?.relayEvent as Nostr.Event;

	function handleChangeBack() {
		localStorage.setItem('back', $backButton.toString());
	}
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase} ">
		<!-- <div class="grid grid-cols-[1fr_auto]"> -->
		<header class={cHeader}>
			{$modalStore[0].title ?? '(title missing)'}
		</header>
		<!-- <div class="history">
				<button
					class="btn-icon variant-filled-surface"
					disabled={!(history.length > 1)}
					on:click={() => {
						history.back();
						modalStore.close();
					}}>{@html LeftIcon}</button
				>
-->

		<div class="flex gap-4">
			<button
				class=" btn-icon variant-filled-surface history"
				on:click={() => {
					goto('/');
					modalStore.close();
				}}>{@html HomeIcon}</button
			>
			{#if !$pubkey_viewer || $pubkey_viewer === ''}
				<div class="flex items-center justify-start">
					<button
						class="mx-1 h-full btn variant-filled-surface fill-white"
						on:click={onClickLogin}
					>
						Login{@html loginIcon}
					</button>(use nip07 extension)
				</div>
			{:else}<div class="flex">
					<select class="select" bind:value={selectValue}>
						{#each Object.keys(kinds) as value (value)}
							<option {value}>{`${kinds[Number(value)]} (${value})`}</option>
						{/each}
					</select><button
						type="button"
						class="mx-1 px-2 btn variant-filled-secondary history"
						on:click={gotoMyList}>{@html LocationHomeIcon}My Page</button
					>
				</div>
			{/if}
		</div>
		<!-- </div> -->
		<!-- </div>  -->

		<!-- Enable for debugging: -->
		<div class="flex gap-2">{$_('modal.info.light_switch')}<LightSwitch /></div>

		<!--ログインの許可のやつ全スキップした人のためとか-->

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

		<div class="space-y-2">
			<label class="flex items-center space-x-2">
				<input
					class="checkbox"
					type="checkbox"
					bind:checked={$backButton}
					on:change={handleChangeBack}
				/>
				<p>{$_('modal.info.backButton')}</p>
			</label>
		</div>

		<!--まるっと共有-->
		<div class="flex gap-2">
			{$_('modal.info.share')}
			<button
				class="btn-icon btn-icon-sm m-0 p-0 variant-filled-primary fill-white"
				on:click={() => {
					res.share = true;
					onFormSubmit();
				}}>{@html shareIcon}</button
			>
		</div>
		<!--NADDRで共有-->
		<div class="flex gap-2">
			{$_('modal.info.shareNaddr')}
			<button
				class="btn-icon btn-icon-sm m-0 p-0 variant-filled-primary fill-white"
				on:click={() => {
					res.shareNaddr = true;
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
		{#if $modalStore[0].value?.relaySet}
			<div>
				<div class="flex-1 gap-3">
					<button
						class="m-auto btn variant-filled-primary p-0 rounded-full fill-white"
						on:click={() => (viewRelays = !viewRelays)}
					>
						{#if viewRelays}
							{@html ViewIcon}
						{:else}
							{@html HideIcon}{/if}
					</button>

					{$_('modal.info.relay.title')}
				</div>
				{#if viewRelays}
					<div class="card p-3">
						<p class="pt-1">
							My{$_('modal.info.relay.white')} kind:{eventTime.kind}
							<button
								class="underline decoration-secondary-400"
								on:click={() => {
									res.openMyJson = true;
									onFormSubmit();
								}}
								>{new Date(eventTime.created_at * 1000).toLocaleString([], {
									year: 'numeric',
									month: '2-digit',
									day: '2-digit',
									hour: '2-digit',
									minute: '2-digit'
								})}
							</button>
						</p>
						{#if $relaySet[$pubkey_viewer].postRelays}
							<ol
								class="bg-surface-50-900-token card max-h-[6em] list overflow-y-auto overflow-x-hidden px-2"
							>
								{#each $relaySet[$pubkey_viewer].postRelays as relay, index}
									<li>
										<span>{index + 1}.</span><span class="break-all"
											>{relay}</span
										>
									</li>
								{/each}
							</ol>
						{/if}
						<div class="card p-3 mt-4">
							<p>
								{$_('modal.info.relay.list')}
								{#if $modalStore[0].value.relaySet.relayEvent}
									kind:{$modalStore[0].value.relaySet.relayEvent.kind}

									<button
										class="underline decoration-secondary-400"
										on:click={() => {
											res.openJson = true;
											onFormSubmit();
										}}
										>{new Date(
											$modalStore[0].value.relaySet.relayEvent.created_at * 1000
										).toLocaleString([], {
											year: 'numeric',
											month: '2-digit',
											day: '2-digit',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</button>
								{/if}
							</p>
							<!-- <p class="pt-1">List</p>
							<ol
								class="bg-surface-50-900-token card max-h-[6em] list overflow-y-auto overflow-x-hidden px-2"
							>
								{#each $modalStore[0].value.relaySet.bookmarkRelays as relay, index}
									<li>
										<span>{index + 1}.</span><span class="break-all"
											>{relay}</span
										>
									</li>
								{/each}
							</ol>

							<p class="pt-1">Note</p>
							<ol
								class="bg-surface-50-900-token card max-h-[6em] list overflow-y-auto px-2"
							>
								{#each $modalStore[0].value.relaySet.searchRelays as relay, index}
									<li>
										<span>{index + 1}.</span><span class="break-all"
											>{relay}</span
										>
									</li>
								{/each}
							</ol> -->
						</div>
					</div>
				{/if}
			</div>
		{/if}
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
				href="https://github.com/TsukemonoGit/nostrviewstr"
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

	:global(.history svg) {
		width: 1.5em;
		height: 1.5em;
		fill: white;
	}
</style>
