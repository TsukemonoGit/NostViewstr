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
	import { goto } from '$app/navigation';

	export let data: PageData;

	console.log('PageData', data.pubkey);

	function settingFunc() {
		settings = true;
		goto('/' + nip19.npubEncode(data.pubkey) + '/' + kind);
	}

	let kind: number = Number(Object.keys(kinds)[0]);
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

<div
	class="container h-full max-w-[1024px] mx-auto flex justify-center items-center p-4"
>
	<div class="mt-5">
		<h1 class="h1 mb-5">{$_('main.title')}</h1>
		<div class="space-t-5">
			<div class="mt-10">
				<h5 class="h5">{`kind`}</h5>

				<select
					class="select"
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
			<Settings {settingFunc} />
		</div>
	</div>
</div>
