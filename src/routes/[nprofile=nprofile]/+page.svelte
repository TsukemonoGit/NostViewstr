<script lang="ts">
	import { page } from '$app/stores';
	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import { _ } from 'svelte-i18n';

	let settings: boolean = false;
	import type { PageData } from './$types';

	import FooterMenu from '$lib/components/FooterMenu.svelte';

	import { kinds } from '$lib/kind';
	import { nip19 } from 'nostr-tools';

	export let data: PageData;

	console.log('PageData', data.pubkey);
	async function settingFunc() {
		settings = true;
	}

	let kind: number;
	let selectValue: any;
	console.log(selectValue);
	function handleKindChange(event: { currentTarget: HTMLSelectElement }) {
		kind = Number(event.currentTarget.value);
		console.log(kind);
	}
</script>

<svelte:head>
	<meta
		name="description"
		content="nostr pubkey:{nip19.npubEncode(data.pubkey)}"
	/>

	<meta
		property="og:description"
		content="pubkey:{nip19.npubEncode(data.pubkey)}"
	/>
</svelte:head>

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

	<!-- <FooterMenu bind:pubkey={data.pubkey} {kind} /> -->
{/if}
