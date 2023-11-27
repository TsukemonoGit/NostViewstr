<script lang="ts">
	import { LightSwitch } from '@skeletonlabs/skeleton';

	import Settings from '$lib/components/Settings.svelte';

	import { settings, nsec, pubkey_viewer } from '$lib/stores/settings';
	import { getPublicKey, nip19 } from 'nostr-tools';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { bookmarkEvents } from '$lib/stores/bookmarkEvents';
	import { _ } from 'svelte-i18n';
	import { kinds } from '$lib/kind';
	let kind: number = Number(Object.keys(kinds)[0]); // Use Object.keys to get the first key

	let name: string;
	let inputValue: string;
	//console.log(sortedKinds);
	//$settings = false;
	const npub = browser ? localStorage.getItem('npub') : undefined;
	if (npub) {
		inputValue = nip19.npubEncode(npub);
	}
	let presettings = false;
	$: console.log($settings);

	//なんでかわからんけど無限ループしたからpresettingsをつけた応急処置
	$: if ($settings === true && !presettings) {
		presettings = true;
		console.log('settings true');
		//inputのpubkeyチェック
		try {
			const input = inputValue;
			const decode = nip19.decode(input);
			if (decode.type === 'npub') {
				localStorage.setItem('npub', decode.data);

				goto(`./${input}/${kind}`);
			} else if (decode.type === 'nsec') {
				$nsec = decode.data;

				const pub = getPublicKey(decode.data);
				localStorage.setItem('npub', pub);
				$pubkey_viewer = pub;
				console.log(pub);
				goto(`./${nip19.npubEncode(pub)}/${kind}`);
			}
		} catch (error) {
			console.error('npubを確認して');
		}
		//okだったらgotoする　NGだったらsettingsをfalseにする
	}
	async function onClickExtension() {
		try {
			const pub = await window.nostr?.getPublicKey();
			if (pub) {
				inputValue = nip19.npubEncode(pub);
				$pubkey_viewer = pub;
			}
		} catch (error) {
			console.log('failed to get pubkey');
		}
	}
	let selectValue: any;
	console.log(selectValue);
	function handleKindChange(event: { currentTarget: HTMLSelectElement }) {
		kind = Number(event.currentTarget.value);
		console.log(kind);
	}
</script>

<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<h1 class="h1">{$_('main.title')}</h1>
		<!-- <p>Start by exploring:</p>
		<ul>
			<li>
				<code class="code">/src/routes/+layout.svelte</code> - barebones layout
			</li>
			<li><code class="code">/src/app.postcss</code> - app wide css</li>
			<li>
				<code class="code">/src/routes/+page.svelte</code> - this page, you can replace
				the contents
			</li>
		</ul> -->

		<div class="space-t-5 min-w-[80vw]">
			<h5 class="h5">{$_('main.input_public_key')}</h5>
			<div class="mt-1 input-group input-group-divider grid-cols-[auto_1fr]">
				<button
					class="p-0 input-group-shim btn variant-filled-secondary"
					on:click={onClickExtension}>nip07<br />extension</button
				>
				<input
					class="input p-1 truncate"
					type="text"
					placeholder="npub1..."
					bind:value={inputValue}
				/>
			</div>
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
		<!-- <label class="label space-t-5 ">
			<span> {$_('main.input_public_key')}</span>
			<input
				class="input p-1"
				type="text"
				placeholder="npub1..."
				bind:value={inputValue}
			/>
		</label> -->
		<div class="space-t-5">
			<Settings />
		</div>
	</div>
</div>
