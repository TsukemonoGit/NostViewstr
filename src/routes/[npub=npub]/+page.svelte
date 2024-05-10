<script lang="ts">
	import { _ } from 'svelte-i18n';

	import Settings from '$lib/components/Settings.svelte';

	import { kinds } from '$lib/kind';
	import { goto } from '$app/navigation';
	import KindSelect from '$lib/components/KindSelect.svelte';

	import { URLPreview, iconView, saveObj } from '$lib/stores/settings';
	import { onMount } from 'svelte';
	//import { onMount } from 'svelte';
	//import { navigating } from '$app/stores';
	export let data;
	let settings: boolean = false;
	let saveCheck: boolean;
	// 初回のみ saveCheck を true にする
	let initialized = false;
	$: {
		if (!initialized && $saveObj !== null) {
			saveCheck = true;
			initialized = true;
		}
	}
	//わざわざこのページ経由する人はべつにgoto捺せ無くていいんじゃ？
	onMount(() => {
		try {
			if (!$saveObj) {
				const saveInfo = localStorage.getItem('info');
				if (!saveInfo) {
					return;
				}
				$saveObj = JSON.parse(saveInfo);
			}
		} catch (error) {}
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
		goto(`${window.location.pathname}/${kind}`);
	}

	$: kind = Number(Object.keys(kinds)[0]);
</script>

<svelte:head>
	<meta
		name="description"
		content="Nostr's replaceable events and parameterized replaceable events viewer"
	/>

	<meta
		property="og:description"
		content="Nostr's replaceable events and parameterized replaceable events viewer"
	/>
</svelte:head>

<div
	class="container max-w-[1024px] h-full mx-auto flex justify-center items-center p-4"
>
	<div class="mt-5">
		<button class="mb-5" on:click={() => goto('/')}
			><h1 class="h1">{$_('main.title')}</h1>
		</button>
		<div class="space-t-5">
			<div class="mt-10">
				<h5 class="h5">{`kind`}</h5>
				<KindSelect bind:selectValue={kind} />
			</div>
		</div>
		<div class="space-t-5">
			<Settings {settingFunc} bind:saveCheck />
		</div>
	</div>
</div>
