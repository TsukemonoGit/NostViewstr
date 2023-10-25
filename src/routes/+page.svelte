<script>
	import 'websocket-polyfill';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';

	let settings = false;
</script>

<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->

<!-- <div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<h1 class="h1">Let's get cracking bones!</h1>
		<p>Start by exploring:</p>
		<ul>
			<li><code class="code">/src/routes/+layout.svelte</code> - barebones layout</li>
			<li><code class="code">/src/app.postcss</code> - app wide css</li>
			<li>
				<code class="code">/src/routes/+page.svelte</code> - this page, you can replace the contents
			</li>
		</ul>
	</div>
</div> -->

<LightSwitch />
{#if !settings}
	<Settings bind:settings />
{:else}
	<ListedEventList />
{/if}
