<script lang="ts">
	import { _ } from 'svelte-i18n';

	import ListedEvent from '$lib/components/ListedEvent.svelte';
	import { checkedIndexList, listNum, rx } from '$lib/stores/bookmarkEvents';
	import { getPub, getRelays } from '$lib/nostrFunctions';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';

	import { initRelaySet, relaySet } from '$lib/stores/relays';
	import {
		URLPreview,
		iconView,
		nip46Check,
		nowProgress,
		pubkey_viewer,
		saveObj
	} from '$lib/stores/settings';
	//import type { Event } from 'nostr-tools';
	import { pageNum } from '$lib/stores/pagination';
	import NostrApp from '$lib/components/nostrData/NostrApp.svelte';

	import type Nostr from 'nostr-typedef';
	import { afterNavigate, goto } from '$app/navigation';

	import FooterMenu from '$lib/components/FooterMenu.svelte';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { toastStore } from '$lib/stores/store';
	import type { PageData } from './$types';
	import { getViewEvent } from './function';
	import Settings from '$lib/components/Settings.svelte';
	import { nip19 } from 'nostr-tools';
	export let data: PageData;
	let bkm: string = 'pub';
	let viewEvent: Nostr.Event<number>;
	let pubkey: string = data.pubkey;
	let kind: number | undefined = data.kind;

	let isOnMount = false;
	let DeleteNote: (e: {
		detail: { number: number; event: any; tagArray: any };
	}) => void;
	let MoveNote: (e: {
		detail: { number: number; event: any; tagArray: any };
	}) => void;
	let CheckNote: (e: {
		detail: { number: number; event: any; tagArray: any };
	}) => void;
	let isOwner: boolean = false;
	$: isOwner = $pubkey_viewer === pubkey;
	let settings: boolean = false;

	function settingFunc() {
		settings = true;
	}
	let relays: string[];
	$: console.log('isOwner', isOwner);
	onMount(async () => {
		if ($iconView === undefined) {
			try {
				if (!$saveObj) {
					const saveInfo = localStorage.getItem('info');
					if (!saveInfo) {
						return;
					}
					$saveObj = JSON.parse(saveInfo);
				}
				if ($saveObj) {
					$iconView = $saveObj.iconView;
					$URLPreview = $saveObj.URLPreview;
				}
			} catch (error) {}
		}
		if (!isOnMount) {
			console.log('onMount');
			isOnMount = true; // onMountが呼ばれたことを示すフラグを変更
			await init();
			isOnMount = false; // onMountが呼ばれたことを示すフラグを変更
		}
	});

	afterNavigate(async () => {
		if (!isOnMount) {
			console.log('afterNavigate');
			isOnMount = true; // onMountが呼ばれたことを示すフラグを変更
			$listNum = 0;
			$pageNum = 0;
			await init();
			isOnMount = false; // onMountが呼ばれたことを示すフラグを変更
		}
	});
	const getSetRelay = async (): Promise<string[]> => {
		if (data.relays) {
			return data.relays;
		}

		if (data.pubkey) {
			$relaySet[data.pubkey] = initRelaySet;
			await getRelays(data.pubkey);
			return $relaySet[data.pubkey].mergeRelays;
		} else {
			return [];
		}
	};
	const init = async () => {
		$nowProgress = true;
		console.log('onMount executed');

		relays = await getSetRelay();
		console.log(relays);
		if (relays.length <= 0) {
			console.log(relays);
			const t: ToastSettings = {
				message: `error`,

				timeout: undefined
			};
			const getRelaysToast = toastStore.trigger(t);
			console.log(getRelaysToast);
			$nowProgress = false;
			return;
		}
		$rx.setDefaultRelays($relaySet[pubkey].mergeRelays);
		viewEvent = await getViewEvent(data.id as string, relays);
		if (!pubkey) {
			pubkey = viewEvent.pubkey;
		}
		if (!kind) {
			kind = viewEvent.kind;
		}

		if ($pubkey_viewer === undefined || $pubkey_viewer === '') {
			try {
				$pubkey_viewer = await getPub($nip46Check);
			} catch (error) {
				console.log(error);
			}
		}
		$nowProgress = false;
	};

	//ページが変わったらチェックリスト空にする
	$: if ($pageNum !== -1 || bkm) {
		$checkedIndexList = [];
		if (typeof window !== 'undefined') {
			window?.scrollTo({ top: 0 });
		}
	}
</script>

<svelte:head>
	<meta
		name="description"
		content="nostr kind:{data.kind}
pubkey:{nip19.npubEncode(pubkey)}"
	/>

	<meta
		property="og:description"
		content="kind:{data.kind}
pubkey:{nip19.npubEncode(pubkey)}"
	/>
</svelte:head>

{#if relays?.length <= 0}
	To display content, please specify relays or pubkey for the Nevent
{:else if $URLPreview === undefined}
	<div
		class="container min-w-[80vw] h-full mx-auto flex justify-center items-center p-4"
	>
		<div class="mt-5">
			<button class="mb-5" on:click={() => goto('/')}
				><h1 class="h1">{$_('main.title')}</h1>
			</button>

			<div class="space-t-5">
				kind:{data.kind}
				<Settings {settingFunc} saveCheck={false} noSave={true} />
			</div>
		</div>
	</div>
{:else}
	<!-- {#await bkminit(pubkey) then bkminti} -->
	{#if kind && typeof WebSocket !== 'undefined' && pubkey && $relaySet && $relaySet[pubkey] && $relaySet[pubkey].mergeRelays && $relaySet[pubkey].mergeRelays.length > 0}
		<NostrApp>
			<!--header-->
			<Header {kind} bind:bkm {pubkey} bind:viewEvent nevent={true} />

			<!--サイドバーとメイン-->
			<div
				class="mb-12 mt-16 container max-w-[1024px] h-full mx-auto justify-center items-center box-border"
			>
				<div class="flex overflow-x-hidden">
					<!--めいん-->
					<main class="flex-1 overflow-y-auto h-fit overflow-x-hidden pb-[2em]">
						<!-- Add ml-64 to push main to the right -->

						<ListedEvent
							{pubkey}
							listEvent={viewEvent}
							{DeleteNote}
							{MoveNote}
							{CheckNote}
							bind:bkm
							{isOwner}
							isNaddr={false}
						/>
					</main>
				</div>
			</div>
			<FooterMenu {pubkey} {kind} disabled={true} {bkm} />
		</NostrApp>
		<!-- {:else}
{`relay has not been set`} -->
	{/if}
{/if}

<!-- {/await} -->

<style>
	:global(.addIcon svg) {
		width: 1.5em;
		height: 1.5em;
	}

	:global(.arrow svg) {
		width: 2em;
		height: 2em;
		fill: white;
	}
	:global(.test1 g) {
		width: 2em;
		height: 2em;
		fill: black;
	}

	:global(.bkm svg) {
		width: 24px;
		height: 24px;
	}
</style>
