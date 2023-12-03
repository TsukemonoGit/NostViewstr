<script lang="ts">
	import { checkRelayExist } from '$lib/nostrFunctions';
	import { relayStore } from '$lib/stores/relays';

	export let tagArray: string[];
	const relayURL = tagArray[1].endsWith('/') ? tagArray[1] : tagArray[1] + '/';

	$: relayInfo = $relayStore.has(relayURL)
		? $relayStore.get(relayURL)
		: undefined;

	$: httpsUrl = relayURL.startsWith('wss://')
		? relayURL.replace(/^wss:/, 'https:')
		: relayURL.replace(/^ws:/, 'http:');

	const relayInfoFun = async () => {
		if ($relayStore.has(relayURL)) {
			return $relayStore.get(relayURL);
		} else {
			const res = await checkRelayExist(tagArray[1]);
			if (res) {
				relayInfo = $relayStore.get(relayURL);
				return $relayStore.get(relayURL);
			} else {
				return undefined;
			}
		}
	};
</script>

{#await relayInfoFun() then tmp}
	{#if !relayInfo}
		{JSON.stringify(tagArray)}
	{:else}
		<!--relays情報 設定-->
		<div class="pl-1 grid grid-cols-[1fr_auto] gap-1">
			<!-- title-description -->
			<div class="grid grid-rows-[auto_auto] gap-1">
				<!-- icon-title -->
				<div class="grid grid-cols-[auto_1fr] gap-1">
					<div
						class="w-12 h-12 rounded-full variant-filled-surface text-center flex items-center justify-center font-bold text-lg"
					>
						{#if relayInfo.icon}
							<img src={relayInfo.icon} class="w-12 h-12 rounded-full" alt="" />
						{:else}
							{relayInfo.name[0]}
						{/if}
					</div>
					<div class="grid grid-rows-[auto_1fr] gap-1">
						<div class="flex items-center gap-1">
							<div class=" h5">{relayInfo.name}</div>

							{#if tagArray[0] === 'r'}
								<div
									class="h-fit border border-primary-400 break-keep text-xs font-bold w-8 text-center"
								>
									{#if tagArray.length <= 2}
										R/W
									{:else if tagArray[2] === 'read'}
										R
									{:else}
										W
									{/if}
								</div>
							{/if}
						</div>
						<div class="flex w-fit">
							<a
								class="anchor"
								href={httpsUrl}
								rel="external noreferrer"
								target="_blank">{tagArray[1]}</a
							>
						</div>
					</div>
				</div>

				<div class="px-1">
					<div>{relayInfo.description}</div>
					<div>
						NIPs:
						{#each relayInfo.supported_nips as nip}
							<a
								class="px-1"
								rel="external noreferrer"
								target="_blank"
								href={'https://github.com/nostr-protocol/nips/blob/master/' +
									nip.toString().padStart(2, '0') +
									'.md'}>{nip}</a
							>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
{/await}
