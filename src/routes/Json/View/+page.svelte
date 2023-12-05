<script lang="ts">
	import { _ } from 'svelte-i18n';

	import ListedEvent from '$lib/components/ListedEvent.svelte';
	//import { listEvent } from '$lib/testData/list';
	import {
		bookmarkEvents,
		checkedIndexList,
		identifierList,
		listNum,
		type Identifiers,
		JsonEventData
	} from '$lib/stores/bookmarkEvents';
	import {
		StoreFetchFilteredEvents,
		addPrivates,
		deletePrivates,
		deletePubs,
		fetchFilteredEvents,
		getPub,
		getRelays,
		isOneDimensionalArray,
		publishEventWithTimeout,
		setRelays,
		updateBkmTag
	} from '$lib/nostrFunctions';
	import { afterUpdate, onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';

	import {
		initRelaySet,
		// searchRelays,
		// postRelays,
		// bookmarkRelays,
		// relayPubkey
		relaySet
	} from '$lib/stores/relays';
	import {
		iconView,
		isMulti,
		nowProgress,
		pubkey_viewer
	} from '$lib/stores/settings';
	//import type { Event } from 'nostr-tools';
	import { amount, listSize, pageNum } from '$lib/stores/pagination';

	import { NostrApp, type Nostr } from 'nosvelte';

	import { afterNavigate } from '$app/navigation';
	import PublishIcon from '@material-design-icons/svg/round/publish.svg?raw';
	import { kindsValidTag } from '$lib/kind';
	import FooterMenu from '$lib/components/FooterMenu.svelte';
	import type {
		ModalComponent,
		ModalSettings,
		ToastSettings
	} from '@skeletonlabs/skeleton';
	import ModalPublishJson from './ModalPublishJson.svelte';
	import { modalStore, toastStore } from '$lib/stores/store';

	let bkm: string = 'pub';
	let viewEvent: Nostr.Event<number> = $JsonEventData;
	let pubkey: string = $JsonEventData.pubkey;

	let isOnMount = false;
	let DeleteNote: (e: CustomEvent<any>) => void;
	let MoveNote: (e: CustomEvent<any>) => void;
	let CheckNote: (e: CustomEvent<any>) => void;
	let isOwner: boolean;
	$: isOwner = $pubkey_viewer === pubkey;
	$: console.log(isOwner);
	onMount(async () => {
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
	//ぷぶきーがかわるごとにしょきか？
	// $: if (pubkey) {
	// 	init();
	// }

	const init = async () => {
		$nowProgress = true;
		console.log('onMount executed');
		// if ($pubkey_viewer === '') {
		// 	try {
		// 		const res = await getPub();
		// 		if (res !== '') {
		// 			$pubkey_viewer = res;
		// 		}
		// 	} catch (error) {
		// 		//			$nowProgress = false;
		// 		console.log('failed to login');
		// 	}
		// }

		await bkminit(pubkey);
		$nowProgress = false;
	};

	export async function bkminit(pub: string) {
		$listNum = 0;
		$pageNum = 0;
		$isMulti = false;
		bkm = 'pub';
		console.log('bkminit');
		if ($pubkey_viewer === undefined || $pubkey_viewer === '') {
			$pubkey_viewer = await getPub();
		}
		if (!$relaySet || !$relaySet[pub]) {
			$relaySet[pub] = initRelaySet;
			// bookmarkRelays.set([]);
			// postRelays.set([]);
			// searchRelays.set([]);
			const t: ToastSettings = {
				message: `${$_('toast.relaySearching')}`
			};
			const getRelaysToast = toastStore.trigger(t);
			$relaySet[pub] = initRelaySet;
			await getRelays(pub);
			toastStore.close(getRelaysToast);
			//$relayPubkey = pubkey;
		}
		if (pub !== $pubkey_viewer && !$relaySet[$pubkey_viewer]) {
			$relaySet[$pubkey_viewer] = initRelaySet;
			// bookmarkRelays.set([]);
			// postRelays.set([]);
			// searchRelays.set([]);
			getRelays($pubkey_viewer);
			//$relayPubkey = pubkey;
		}
	}

	//ページが変わったらチェックリスト空にする
	$: if ($pageNum !== -1 || bkm) {
		$checkedIndexList = [];
		window.scrollTo({ top: 0 });
	}

	function onClickPage(arg0: number): any {
		$listNum += arg0;
	}

	//--------------------------------------Add note
	const publishJsonModalComponent: ModalComponent = {
		ref: ModalPublishJson
	};
	function onClickAddfromJson(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		let newEvent = Object.assign({}, $JsonEventData); //参照の問題を回避
		newEvent.created_at = '<generated>' as any; // 一時的にanyとしてキャストするか、正しい型に変更する
		newEvent.sig = '<generated>' as any;
		newEvent.pubkey = '<generated>' as any;
		newEvent.id = '<generated>' as any;

		const modal: ModalSettings = {
			type: 'component',
			component: publishJsonModalComponent,
			title: $_('modal.publishjson.title'),
			body: `${$_('modal.publishjson.body')}`,
			value: {
				event: newEvent
			},
			response: async (res) => {
				//console.log(res);
				if (res) {
					$nowProgress = true;
					console.log(res);
					//updateするやつ
					const result = await publishEventWithTimeout(
						res,
						$relaySet[$pubkey_viewer]?.bookmarkRelays || []
					);

					const toastMessage = result.isSuccess
						? 'Add note<br>' + result.msg
						: $_('toast.failed_publish');

					const t = {
						message: toastMessage,
						timeout: 3000,
						background: result.isSuccess
							? 'variant-filled-secondary width-filled'
							: 'bg-orange-500 text-white width-filled '
					};

					toastStore.trigger(t);

					$nowProgress = false;
				}
			}
		};
		modalStore.trigger(modal);
	}
</script>

<!-- {#await bkminit(pubkey) then bkminti} -->

<!--header-->
<Header
	kind={$JsonEventData.kind}
	bind:bkm
	{pubkey}
	bind:viewEvent
	JSON={true}
/>

<!--サイドバーとメイン-->
<div
	class="mb-12 mt-16 container max-w-[1024px] h-full mx-auto justify-center items-center box-border"
>
	<div class="flex overflow-x-hidden">
		<!--めいん-->
		<main class="flex-1 overflow-y-auto h-fit overflow-x-hidden pb-[2em]">
			<!-- Add ml-64 to push main to the right -->
			{#if $relaySet && $relaySet[pubkey] && $relaySet[pubkey].searchRelays && $relaySet[pubkey].searchRelays.length > 0}
				<NostrApp relays={$relaySet[pubkey].searchRelays}>
					<ListedEvent
						{pubkey}
						listEvent={viewEvent}
						{DeleteNote}
						{MoveNote}
						{CheckNote}
						bind:bkm
						{isOwner}
						noEdit={true}
					/>
				</NostrApp>
				<!-- {:else}
				{`relay has not been set`} -->
			{/if}
		</main>
	</div>
</div>
<FooterMenu
	pubkey={$JsonEventData.pubkey}
	kind={$JsonEventData.kind}
	disabled={true}
/>

<!-------------------------------あど----->
<!-------------------------------あど----->
{#if !$nowProgress}
	<div class="fixed bottom-14 z-10 box-border overflow-x-hidden add">
		<div class="fill-white overflow-x-hidden h-fit overflow-y-auto">
			<button
				class="addIcon btn-icon variant-filled-secondary fill-white hover:variant-ghost-secondary hover:stroke-secondary-500 overflow-x-hidden"
				on:click={onClickAddfromJson}>{@html PublishIcon}</button
			>
		</div>
	</div>
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
	.add {
		/* コンテナのMAXサイズが1024pxなので半分の512より手前らへんに */
		left: min(calc(50% + 440px), calc(100% - 60px));
		overflow-x: hidden;
	}
</style>
