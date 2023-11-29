<script lang="ts">
	import { page } from '$app/stores';
	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import { _ } from 'svelte-i18n';

	let settings: boolean = false;
	import type { PageData } from './$types';

	import FooterMenu from '$lib/components/FooterMenu.svelte';

	import { kinds } from '$lib/kind';

	export let data: PageData;

	console.log('PageData', data.pubkey);
	async function settingFunc() {
		settings = true;
	}
	//$: console.log($relaySet[data.pubkey].bookmarkRelays);
	// $: console.log($URLPreview);
	// $: console.log($iconView);
	// onMount(async () => {
	// 	if ($pubkey_viewer === undefined || $pubkey_viewer === '') {
	// 		$pubkey_viewer = await getPub();
	// 	}
	// });
	// onMount(async () => {
	// 	console.log(await getRelays(data.pubkey));
	// }); //await setRelays(testRelay);}}
	let kind: number;
	let selectValue: any;
	console.log(selectValue);
	function handleKindChange(event: { currentTarget: HTMLSelectElement }) {
		kind = Number(event.currentTarget.value);
		console.log(kind);
	}
</script>

<!-- <div class="break-all">
	<p>npub:{$page.params.npub}</p>
	<p>read:{$searchRelays}</p>
	<p>write:{$postRelays}</p>
	<p>kind:?</p>
</div> -->

{#if !settings}
	<div class="container h-full mx-auto flex justify-center items-center">
		<div class="mt-5">
			<h1 class="h1 mb-5">{$_('main.title')}</h1>
			<div class="space-t-5 min-w-[80vw]">
				<div class="mt-10">
					<h5 class="h5">{`kind`}</h5>

					<select
						class="input p-1"
						bind:value={selectValue}
						on:change={handleKindChange}
					>
						{#each Object.keys(kinds) as value (value)}
							<option {value}>{`${kinds[Number(value)]} (${value})`}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="space-t-5">
				<settingFunc />
			</div>
		</div>
	</div>
{:else}
	<ListedEventList bind:pubkey={data.pubkey} {kind} isNaddr={false} />

	<FooterMenu bind:pubkey={data.pubkey} {kind} />
{/if}
