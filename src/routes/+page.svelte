<script lang="ts">
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import ListedEventList from '$lib/components/ListedEventList.svelte';
	import Settings from '$lib/components/Settings.svelte';

	import { settings, nsec, pubkey_viewer } from '$lib/stores/settings';
	import { getPublicKey, nip19 } from 'nostr-tools';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { bookmarkEvents } from '$lib/stores/bookmarkEvents';

	let inputValue: string;
	$settings = false;
	const npub = browser ? localStorage.getItem('npub') : undefined;
	if (npub) {
		inputValue = nip19.npubEncode(npub);
	}
	$: console.log($settings);
	$: if ($settings === true) {
		console.log('settings true');
		//inputのpubkeyチェック
		try {
			const input = inputValue;
			const decode = nip19.decode(input);
			if (decode.type === 'npub') {
				localStorage.setItem('npub', decode.data);
				if ($bookmarkEvents && $bookmarkEvents.length > 0) {
					$bookmarkEvents = [];
				}
				$pubkey_viewer = '';
				goto(`./${input}`);
			} else if (decode.type === 'nsec') {
				$nsec = decode.data;

				const pub = getPublicKey(decode.data);
				localStorage.setItem('npub', pub);
				$pubkey_viewer = pub;
				goto(`./${nip19.npubEncode(pub)}`);
			}
		} catch (error) {
			console.error('npubを確認して');
		}
		//okだったらgotoする　NGだったらsettingsをfalseにする
	}
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
<input
	class="input"
	type="text"
	placeholder="npub1..."
	bind:value={inputValue}
/>
<Settings />
