<script lang="ts">
	import Settings from '$lib/components/Settings.svelte';
	import KindSelect from '$lib/components/KindSelect.svelte';
	import { nsec, pubkey_viewer } from '$lib/stores/settings';
	import { getPublicKey, nip19 } from 'nostr-tools';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	import { _ } from 'svelte-i18n';
	import { kinds } from '$lib/kind';
	import { toastStore } from '$lib/stores/store';

	// let selectValue: string;
	$: kind = Number(Object.keys(kinds)[0]);
	// $: kind = Number(selectValue); // Use Object.keys to get the first key
	//$: console.log(kind);
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
</script>

<svelte:head>
	<meta
		property="og:description"
		content="Nostr's replaceable events and parameterized replaceable events viewer"
	/>
	<meta name="description" content="home" />
</svelte:head>

<div
	class="container max-w-[1024px] h-full mx-auto flex-row justify-center items-center p-4"
>
	<h1 class="h1">{$_('main.title')}</h1>

	<h5 class="h5 mt-8">{$_('main.input_public_key')}</h5>

	<div class="mt-1 input-group input-group-divider grid-cols-[auto_1fr]">
		<!--	<button
					class="p-0 input-group-shim btn variant-filled-secondary"
					on:click={onSignupClick}>NIP-46<br />Connect</button
				>
				 <span class="flex items-center">or</span> -->
		<button
			style="padding:0 0.5rem"
			class=" input-group-shim btn variant-filled-primary"
			on:click={onClickExtension}>use NIP-07<br />or NIP-46</button
		>

		<input
			class="input p-1 truncate"
			type="text"
			placeholder="npub..."
			bind:value={inputValue}
		/>
	</div>

	<div class="ml-2 mt-1 text-sm break-all">
		<p>
			- <a
				class="anchor"
				rel="external noreferrer"
				target="_blank"
				href="https://github.com/nostr-protocol/nips/blob/master/07.md"
				>NIP-07</a
			>
			<span
				>(e.g. <a
					class="anchor"
					rel="external noreferrer"
					target="_blank"
					href="https://chromewebstore.google.com/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp"
					>nos2x</a
				>)</span
			>
		</p>

		<p>
			- <a
				class="anchor"
				rel="external noreferrer"
				target="_blank"
				href="https://github.com/nostr-protocol/nips/blob/master/46.md"
				>NIP-46</a
			>
			<span
				>(e.g. <a
					class="anchor"
					rel="external noreferrer"
					target="_blank"
					href="https://nsec.app/">nsec.app</a
				>)</span
			>
		</p>

		<!-- <div class="mt-10">
			

				<button class=" btn variant-filled-secondary" on:click={onSignupClick}
					>Login with NIP-46 Nostr Connect</button
				>
				<div class="ml-2 mt-1 text-sm whitespace-pre-wrap">
					{$_('main.Nip46_login')}
				</div>
			</div> -->
		<div class="mt-10">
			<h5 class="h5">
				<svg
					class="inline-flex"
					xmlns="http://www.w3.org/2000/svg"
					width="1.2em"
					height="1.2em"
					viewBox="0 0 48 48"
					><g fill="none" stroke-linejoin="round" stroke-width="4"
						><path
							fill="#0FBA81"
							stroke="currentColor"
							d="M34 5H8C6.34315 5 5 6.34315 5 8V34C5 35.6569 6.34315 37 8 37H34C35.6569 37 37 35.6569 37 34V8C37 6.34315 35.6569 5 34 5Z"
						/><path
							stroke="currentColor"
							stroke-linecap="round"
							d="M43.9998 13.002V42.0001C43.9998 43.1046 43.1044 44.0001 41.9998 44.0001H13.0034"
						/><path
							stroke="#fff"
							stroke-linecap="round"
							d="M13 20.4858L18.9997 26.0109L29 15.7192"
						/></g
					></svg
				>
				{$_('main.input_kind')}
			</h5>

			<KindSelect bind:selectValue={kind} />
			<!-- <select
					class="select"
					bind:value={selectValue}
					on:change={handleKindChange}
				>
					{#each Object.keys(kinds) as value (value)}
						<option {value}>{`${kinds[Number(value)]} (${value})`}</option>
					{/each}
				</select> -->
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
	<div class="mt-10 flex gap-2 mb-14">
		<h5 class="h5 self-center">
			<svg
				class="inline-flex"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				><g
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" /><path
						d="M14 2v4a2 2 0 0 0 2 2h4M4 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1m4 0a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1a1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"
					/></g
				></svg
			>{$_('main.Json')}
		</h5>
		<button
			class="btn variant-filled-primary"
			on:click={() => {
				goto(`/Json`);
			}}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 14 14"
				><path
					fill="currentColor"
					fill-rule="evenodd"
					d="M2.676.02a1.74 1.74 0 0 0-.845.218a1.64 1.64 0 0 0-.895 1.433v10.677a1.64 1.64 0 0 0 .895 1.433a1.74 1.74 0 0 0 1.718-.016l8.63-5.338a1.61 1.61 0 0 0-.001-2.876L3.548.253A1.74 1.74 0 0 0 2.676.02"
					clip-rule="evenodd"
				/></svg
			>
		</button>
	</div>
</div>
