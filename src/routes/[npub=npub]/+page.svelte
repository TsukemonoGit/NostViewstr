<script lang="ts">
	import { _ } from 'svelte-i18n';

	import Settings from '$lib/components/Settings.svelte';

	import { kinds } from '$lib/kind';
	import { goto } from '$app/navigation';
	import KindSelect from '$lib/components/KindSelect.svelte';
	//export let data: PageData;
	let settings: boolean = false;
	function settingFunc() {
		settings = true;
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
		<h1 class="h1 mb-5">{$_('main.title')}</h1>
		<div class="space-t-5">
			<div class="mt-10">
				<h5 class="h5">{`kind`}</h5>
				<KindSelect bind:selectValue={kind} />
			</div>
		</div>
		<div class="space-t-5">
			<Settings {settingFunc} />
		</div>
	</div>
</div>
