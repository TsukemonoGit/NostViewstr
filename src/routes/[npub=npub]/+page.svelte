<script lang="ts">
	import { _ } from 'svelte-i18n';

	import Settings from '$lib/components/Settings.svelte';

	import { kinds } from '$lib/kind';
	import { goto } from '$app/navigation';

	//export let data: PageData;
	let settings: boolean = false;
	function settingFunc() {
		settings = true;
		goto(`${window.location.pathname}/${kind}`);
	}

	let kind: number = Number(Object.keys(kinds)[0]);
	let selectValue = Object.keys(kinds)[0];
	console.log(selectValue);
	function handleKindChange(event: { currentTarget: HTMLSelectElement }) {
		kind = Number(event.currentTarget.value);
		console.log(kind);
	}
</script>

<svelte:head>
	<meta name="description" content="home" />

	<meta property="og:description" content="home" />
</svelte:head>

{#if !settings}
	<div class="container h-full mx-auto flex justify-center items-center">
		<div class="mt-5">
			<h1 class="h1 mb-5">{$_('main.title')}</h1>
			<div class="space-t-5 min-w-[80vw]">
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
{/if}
