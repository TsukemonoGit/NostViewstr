<script lang="ts">
	//書き込めるところに書き込むということでwrite二設定しているリレーに複製します
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { modalStore, toastStore } from '$lib/stores/store';
	import type { Nostr } from 'nosvelte';
	import {
		createRxNostr,
		createRxOneshotReq,
		type EventPacket,
		verify
	} from 'rx-nostr';
	import { postRelays, searchRelays } from '$lib/stores/relays';
	import type { Observer, Subscription } from 'rxjs';

	export let parent: any;
	enum RelayState {
		Preparing,
		Connecting,
		Not_exist,
		Error,
		Exist
	}
	interface RelayStates {
		[key: string]: RelayState;
	}
	const relays = [
		'wss://nos.lol',
		'wss://relay.damus.io',
		//'wss://relay.snort.social',
		'wss://nostr-pub.wellorder.net',
		'wss://relay.nostr.band',
		'wss://yabu.me',
		'wss://relay-jp.nostr.wirednet.jp',
		'wss://relay.nostr.wirednet.jp',
		'wss://nostr-relay.nokotaro.com',
		//'wss://nostr.holybea.com',
		'wss://nostr.wine',
		'wss://nostr.bitcoiner.social',
		'wss://relay.nostr.bg',
		'wss://nostr.mom',
		'wss://relay.orangepill.dev',
		// 'wss://no.str.cr',
		'wss://relay.nostr.com.au',
		'wss://offchain.pub',
		// 'wss://relay.plebstr.com',
		'wss://nostr.fmt.wiz.biz',
		//'wss://nostr.rocks',
		'wss://nostr.mutinywallet.com',
		'wss://e.nos.lol',
		'wss://relayable.org',
		'wss://relay.mostr.pub'
	];

	//   const relaysState = relays.map((relay) => {
	//     return { relay: relay, state: RelayState.Preparing };
	//   });

	let relaysState: RelayStates = {};

	relays.forEach((relay) => {
		relaysState[relay] = RelayState.Preparing;
	});

	$: relaysState = relaysState;
	//   const relaysState = relays.map((relay) => {
	//     return { [relay]: RelayState.Preparing };
	//   });
	//let isSuccess: boolean = false;
	const inievent: Nostr.Event<number> = {
		id: '',
		pubkey: '',
		created_at: 0,
		kind: 1,
		tags: [],
		content: '',
		sig: ''
	};

	let event: Nostr.Event<number> = {
		id: '',
		pubkey: '',
		created_at: 0,
		kind: 1,
		tags: [],
		content: '',
		sig: ''
	};

	let res = {};
	let subscription: Subscription;
	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response(res);

		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	// const cForm =
	//   'border border-surface-500 p-4 space-y-4 rounded-container-token';

	function stateColor(state: RelayState): string {
		// ここで各状態に対応するクラスを返すように修正する
		switch (state) {
			case RelayState.Connecting:
				return 'badge bg-surface-400';
			case RelayState.Not_exist:
				return 'badge bg-warning-400';
			case RelayState.Error:
				return 'badge bg-error-400';
			case RelayState.Exist:
				return 'badge bg-success-500';
			default:
				return 'badge bg-surface-300';
		}
	}

	let logs: string[] = [];
	$: logs = logs;
	let nowLoading: boolean = false;
	const rxNostr = createRxNostr();
	rxNostr.setRelays(relays);

	function onClick() {
		if (subscription && !subscription.closed) {
			return;
		}
		nowLoading = true;
		//isSuccess = false;
		logs = [];
		event = inievent;

		console.log($modalStore[0].value.filter);
		const filters = [$modalStore[0].value.filter];
		const rxReq = createRxOneshotReq({ filters });

		relays.forEach((relay) => {
			relaysState[relay] = RelayState.Connecting;
		});
		// データの購読
		const observable = rxNostr.use(rxReq).pipe(verify());

		// オブザーバーオブジェクトの作成
		const observer: Observer<any> = {
			next: (packet: EventPacket) => {
				console.log(packet);
				relaysState[packet.from] = RelayState.Exist;
				event = packet.event;
			},
			error: (error) => {
				console.error('Error occurred:', error);
			},
			complete: () => {
				console.log('Subscription completed');
				nowLoading = false;
			}
		};
		// 購読開始
		subscription = observable.subscribe(observer);
		// 全エラーを監視するObservableの購読
		const rxErrorSubscription = rxNostr
			.createAllErrorObservable()
			.subscribe((error) => {
				console.error('Error occurred globally:', error);
				// グローバルなエラー処理を行う
				relaysState[error.from] = RelayState.Error;
			});

		// Send CLOSE message in 10 seconds
		setTimeout(() => {
			subscription.unsubscribe();
			nowLoading = false;
			if (event.sig === '') {
				logs.push(`failed to get Event`);
			}
			rxErrorSubscription.unsubscribe();
		}, 5 * 1000);
	}
	// ウェブソケットを保持する配列
	let webSockets: WebSocket[] = [];
	async function onClickDup() {
		nowLoading = true;
		if (!subscription.closed) {
			subscription.unsubscribe();
		}
		for (let i = 0; i < $postRelays.length; i++) {
			const ws = new WebSocket($postRelays[i]);
			webSockets.push(ws);
			ws.onopen = () => {
				logs.push(`Connected to ${$postRelays[i]}`);
				logs = logs;
				ws.send(JSON.stringify(['EVENT', event]));
			};
			ws.onmessage = (e) => {
				console.log(e);
				const msg = JSON.parse(e.data);

				logs.push(`message from ${$postRelays[i]}: ${e.data}`);
				logs = logs;
				if (msg[2]) {
					logs.push(
						`<span class="font-bold">Success: ${$postRelays[i]}</span>`
					);
					logs = logs;
					// isSuccess = true;
				} else {
					logs.push(
						`<span class="font-bold">Failed: ${$postRelays[1]}</span> (reason:  ${msg[3]})`
					);
					logs = logs;
				}
				ws.close();
				nowLoading = false;
			};
		}
	}
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase} overflow-h-auto">
		<div class="grid grid-cols-[1fr_auto]">
			<header class={cHeader}>
				{$modalStore[0].title ?? '(title missing)'}
			</header>
			{#if nowLoading}
				<ProgressRadial
					...
					stroke={100}
					meter="stroke-primary-500"
					track="stroke-primary-500/30"
					width="w-12"
				/>
			{/if}
		</div>
		<article class="body break-all whitespace-pre-wrap text-xs">
			{#if $modalStore[0].value.filter}
				filter:<br />
				{JSON.stringify($modalStore[0].value.filter, null, 2)}
			{/if}
		</article>
		<!-- Enable for debugging: -->
		<div class="break-all text-sm grid grid-cols-[0.5fr_0.5fr]">
			{#each relays as relay, index}
				<div class="card m-0 p-0 text-sm bg-grey">
					<span class={stateColor(relaysState[relay])} />
					{relay}
				</div>
			{/each}
		</div>

		<button class="btn {parent.buttonNeutral}" on:click={onClick}>search</button
		>

		{#if $modalStore[0].value.isPageOwner && event.sig !== ''}
			<button class="btn {parent.buttonNeutral}" on:click={onClickDup}
				>duplicate</button
			>
		{/if}
		{#if event.sig !== ''}
			<div class="border">Event</div>
			<div class="break-all whitespace-pre-wrap max-h-[8rem] overflow-y-auto">
				{JSON.stringify(event, null, 2)}
			</div>
		{/if}
		{#if logs.length > 0}
			<div class="border">Log</div>
			<div class="break-all whitespace-pre-wrap max-h-[8rem] overflow-y-auto">
				{#each logs as l}
					<div class="break-all whitespace-pre-wrap">{@html l}</div>
				{/each}
			</div>
		{/if}
		<label class="label break-all whitespace-pre-wrap">
			<!-- prettier-ignore -->
			<footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" on:click={()=>{ if(subscription && !subscription.closed){subscription.unsubscribe();}webSockets.forEach((ws) => {
     if(ws.OPEN){ ws.close();}
    }); parent.onClose()}}>{parent.buttonTextCancel}</button>
        
        </footer>
		</label>
	</div>
{/if}
