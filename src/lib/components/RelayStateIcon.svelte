<script lang="ts">
	import type { ConnectionState, DefaultRelayConfig } from 'rx-nostr';
	import { relayState } from '$lib/stores/bookmarkEvents';
	import UpdateIcon from '@material-design-icons/svg/round/update.svg?raw';
	import { GetRelayState, ReconnectRelay } from '$lib/streamEventLists';
	import { get, writable } from 'svelte/store';
	import { cleanRelayUrl } from '$lib/otherFunctions';

	//$: stateArray = Array.from($relayState.keys()).sort();
	export let readTrueArray: string[];

	//export let pubkey: string;
	// ボタンの無効化を管理するストア
	const disabledButtons = writable(new Set<string>());

	let stateColor = {
		initialized: 'bg-surface-500',
		connecting: 'bg-surface-500',
		connected: 'bg-success-600', //接続中
		retrying: 'bg-surface-600',
		'waiting-for-retrying': 'bg-warning-600',
		dormant: 'bg-surface-600',
		error: 'bg-error-600',
		rejected: 'bg-error-600',
		terminated: 'bg-surface-600'
	};

	let dotColor = (relay: ConnectionState | undefined) => {
		const status = relay ?? 'error';
		// 確認してからstateColorにアクセス
		return stateColor[status];
	};

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
			setTimeout(
				() => {
					const currentDisabledButtons = get(disabledButtons);
					currentDisabledButtons.delete(relay);
					disabledButtons.set(currentDisabledButtons);
				},
				5 * 60 * 1000
			);
		}
	}
</script>

{#each readTrueArray as relay, index}
	{@const relayUrl = cleanRelayUrl(relay)}
	{#if $relayState.get(relayUrl) !== undefined}
		<div class="flex items-center gap-1 break-all">
			<div
				class="h-4 w-4 rounded-full {dotColor($relayState.get(relayUrl))}"
				title={$relayState.get(relayUrl)}
			/>
			{relayUrl.length > 30 ? `${relayUrl.slice(0, 28)}...` : relayUrl}

			<!-- {#if ($relayState[relay] === 'error' || $relayState[relay] === 'not-started' || $relayState[relay] === 'terminated') && !get(disabledButtons).has(relay)} -->

			{#if $relayState.get(relayUrl) === 'error' && !get(disabledButtons).has(relayUrl)}
				<button
					on:click={() => handleClickReconnect(relayUrl)}
					class="btn p-1 fill-black dark:fill-white ml-auto"
				>
					{@html UpdateIcon}
				</button>
			{/if}
		</div>
	{/if}
{/each}
