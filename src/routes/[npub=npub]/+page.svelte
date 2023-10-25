<script>
	import { page } from '$app/stores';
	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';

	import { URLPreview, iconView, settings } from '$lib/stores/settings';
	import { LightSwitch } from '@skeletonlabs/skeleton';

	$: console.log($URLPreview);
	$: console.log($iconView);
</script>

npub:{$page.params.npub}
<LightSwitch />
{#if !$settings}
	<Settings />
{:else}
	<ListedEventList />
{/if}
