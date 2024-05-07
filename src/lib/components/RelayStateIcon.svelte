<script lang="ts">
	import type { ConnectionState } from 'rx-nostr';
	import { connectingRelays, relayState } from '$lib/stores/bookmarkEvents';
	import UpdateIcon from '@material-design-icons/svg/round/update.svg?raw';
	import { GetRelayState, ReconnectRelay } from '$lib/streamEventLists';
	import { get, writable } from 'svelte/store';
	import { relaySet } from '$lib/stores/relays';
	//$: stateArray = Array.from($relayState.keys()).sort();

	//export let pubkey: string;
	// ボタンの無効化を管理するストア
	const disabledButtons = writable(new Set<string>());
	export let readTrueArray: string[];
	let stateColor = {
		initialized: 'bg-surface-500',
		connecting: 'bg-surface-500',
		connected: 'bg-success-600', //接続中
		retrying: 'bg-warning-600',
		'waiting-for-retrying': 'bg-warning-600',
		dormant: 'bg-warning-600',
		error: 'bg-error-600',
		rejected: 'bg-error-600',
		terminated: 'bg-error-600'
	};

	let dotColor = (relay: string) => {
		const relayStateValue = $relayState.get(relay);
		// try {
		// 	console.log(GetRelayState(relay));
		// } catch (error) {
		// 	console.log(error);
		// }

		// 確認してからstateColorにアクセス
		return relayStateValue !== undefined
			? stateColor[relayStateValue]
			: 'not-started';
	};
	$: console.log($relayState);
	async function handleClickReconnect(relay: string) {
		// ボタンが無効でない場合に処理を実行
		if (!get(disabledButtons).has(relay)) {
			// リコネクト処理
			await ReconnectRelay(relay);

			// ボタンを無効化する
			const newDisabledButtons = new Set(get(disabledButtons));
			newDisabledButtons.add(relay);
			disabledButtons.set(newDisabledButtons);

			// 5分後にボタンを再び有効化する
			setTimeout(() => {
				const currentDisabledButtons = get(disabledButtons);
				currentDisabledButtons.delete(relay);
				disabledButtons.set(currentDisabledButtons);
			}, 5 * 60 * 1000);
		}
	}
</script>

{#each readTrueArray as relay, index}
	{#if $relayState?.get(relay) !== undefined}
		<div class="flex items-center gap-1 break-all">
			<div class="h-4 w-4 rounded-full {dotColor(relay)} " />
			{relay.length > 30 ? `${relay.slice(0, 28)}...` : relay}

			<!-- {#if ($relayState[relay] === 'error' || $relayState[relay] === 'not-started' || $relayState[relay] === 'terminated') && !get(disabledButtons).has(relay)} -->

			{#if $relayState.get(relay) === 'error' && !get(disabledButtons).has(relay)}
				<button
					on:click={() => handleClickReconnect(relay)}
					class="btn p-1 fill-white ml-auto"
				>
					{@html UpdateIcon}
				</button>
			{/if}
		</div>
	{/if}
{/each}
