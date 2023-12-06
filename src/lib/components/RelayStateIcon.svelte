<script lang="ts">
	import type { ConnectionState } from 'rx-nostr';
	import { relayState } from '$lib/stores/bookmarkEvents';
	import UpdateIcon from '@material-design-icons/svg/round/update.svg?raw';
	import { ReconnectRelay } from '$lib/streamEventLists';
	import { get, writable } from 'svelte/store';
	$: stateArray = Array.from($relayState.keys()).sort();
	// ボタンの無効化を管理するストア
	const disabledButtons = writable(new Set<string>());

	let stateColor = {
		ongoing: 'bg-success-600',
		error: 'bg-warning-600',
		rejected: 'bg-black',
		terminated: 'bg-surface-600',
		'not-started': 'bg-surface-700',
		starting: 'bg-surface-400',
		reconnecting: 'bg-error-600'
	};

	let dotColor = (relay: string) => {
		const relayStateValue = $relayState.get(relay);

		// 確認してからstateColorにアクセス
		return relayStateValue !== undefined
			? stateColor[relayStateValue]
			: 'not-started';
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
			setTimeout(() => {
				const currentDisabledButtons = get(disabledButtons);
				currentDisabledButtons.delete(relay);
				disabledButtons.set(currentDisabledButtons);
			}, 5 * 60 * 1000);
		}
	}
</script>

{#each stateArray as relay, index}
	{#if $relayState.has(relay)}
		<div class="flex items-center gap-1 break-all">
			<div class="h-4 w-4 rounded-full {dotColor(relay)}" />
			{relay.length > 30 ? `${relay.slice(0, 30)}...` : relay}
			{#if ($relayState.get(relay) === 'error' || $relayState.get(relay) === 'not-started') && !get(disabledButtons).has(relay)}
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
