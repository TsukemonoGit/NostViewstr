<script lang="ts">
	import { FileButton, LightSwitch } from '@skeletonlabs/skeleton';

	import Settings from '$lib/components/Settings.svelte';

	import { nsec, pubkey_viewer } from '$lib/stores/settings';
	import { getPublicKey, nip19 } from 'nostr-tools';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	import { _ } from 'svelte-i18n';
	import { kinds } from '$lib/kind';
	import { toastStore } from '$lib/stores/store';
	import { launch as launchNostrLoginDialog } from 'nostr-login';

	let kind: number = Number(Object.keys(kinds)[0]); // Use Object.keys to get the first key

	//let name: string;
	let inputValue: string;
	//console.log(sortedKinds);
	//$settings = false;
	const npub = browser ? localStorage.getItem('npub') : undefined;
	if (npub) {
		inputValue = nip19.npubEncode(npub);
	}
	//let presettings = false;
	//$: console.log($settings);

	//なんでかわからんけど無限ループしたからpresettingsをつけた応急処置
	//$: if ($settings === true && !presettings) {
	async function settingFunc() {
		//presettings = true;
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
			const t = {
				message: $_('toast.failed_npub'),
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
			//$settings = false;
			//	presettings = false;
			//console.error('npubを確認して');
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
	//console.log(selectValue);
	function handleKindChange(event: { currentTarget: HTMLSelectElement }) {
		kind = Number(event.currentTarget.value);
		console.log(kind);
	}

	let nostrAddress: string;

	function onSignupClick() {
		// launch signup screen
		launchNostrLoginDialog({
			startScreen: 'signup'
		});
	}
</script>

<svelte:head>
	<meta
		property="og:description"
		content="Nostr's replaceable events and parameterized replaceable events viewer"
	/>
	<meta name="description" content="home" />
</svelte:head>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<h1 class="h1">{$_('main.title')}</h1>

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
					placeholder="npub... or nsec..."
					bind:value={inputValue}
				/>
			</div>
			<div class="ml-2 mt-1 text-sm whitespace-pre-wrap">
				{$_('main.publish')}
			</div>
			<div class="mt-10">
				<!-- <h5 class="h5">Option: {$_('main.Nip46_login')}</h5> -->

				<button class=" btn variant-filled-secondary" on:click={onSignupClick}
					>Login with NIP-46 Nostr Connect</button
				>
				<div class="ml-2 mt-1 text-sm whitespace-pre-wrap">
					{$_('main.Nip46_login')}
				</div>
			</div>
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
			<div class="mt-10 flex gap-2">
				<h5 class="h5 self-center">{`view from json →`}</h5>
				<button
					class="btn variant-filled-primary"
					on:click={() => {
						goto(`/Json`);
					}}
				>
					Click
				</button>
			</div>
			<!-- <div class="flex gap-4 mt-1">
					<div>
						<FileButton bind:files on:change={handleFileChange} name="files" />
					</div>
					<div>
						<button
							class="btn variant-filled-primary"
							on:click={() => {
								fileData = undefined;
							}}>Reset</button
						>
					</div>
				</div>
			</div>
			{#if fileData}
				{fileData.name}
			{/if} -->
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
			<Settings {settingFunc} />
		</div>
	</div>
</div>
