<script lang="ts">
	import Settings from '$lib/components/Settings.svelte';
	import { _ } from 'svelte-i18n';

	let settings: boolean = false;
	import type { PageData } from './$types';

	import { kinds } from '$lib/kind';
	import { nip19 } from 'nostr-tools';
	import { goto } from '$app/navigation';
	import { URLPreview, iconView, saveObj } from '$lib/stores/settings';
	import { onMount } from 'svelte';

	export let data: PageData;
	let saveCheck: boolean;

	onMount(() => {
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
		if ($saveObj) {
			saveCheck = true;
		}
	});
	function settingFunc() {
		settings = true;
		if (saveCheck) {
			const obj = {
				pub: data.pubkey,
				kind: kind,
				iconView: $iconView,
				URLPreview: $URLPreview
			};
			localStorage.setItem('info', JSON.stringify(obj));
			$saveObj = obj;
		} else {
			localStorage.removeItem('info');
			$saveObj = null;
		}
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
		<button class="mb-5" on:click={() => goto('/')}
			><h1 class="h1">{$_('main.title')}</h1>
		</button>
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
			<Settings {settingFunc} bind:saveCheck />
		</div>
	</div>
</div>
