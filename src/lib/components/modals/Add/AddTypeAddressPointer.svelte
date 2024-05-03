<script lang="ts">
	import { checkInputNaddr } from '$lib/nostrFunctions';
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { nip19 } from 'nostr-tools';
	import { naddrVaridKind } from '$lib/kind';
	import { nowProgress } from '$lib/stores/settings';
	import PublicButton from './PublicButton.svelte';
	import PrivateButton from './PrivateButton.svelte';

	export let res: { btn: string; tag: string[] };
	export let parent: any;
	export let onFormSubmit: any;
	let input: string;
	export let kind;

	export let selectBoxItem: string[];
	export let selectItem: string;

	const myValue = 'Event';

	if (!selectBoxItem.includes(myValue)) {
		selectBoxItem.push(myValue);
	}

	async function onClickNaddr() {
		const check = await checkInputNaddr(input);
		if (check.error && check.message) {
			const t = {
				message: check.message,
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
			//		$nowProgress = false;
			return;
		} else if (check.tag) {
			res.tag = check.tag;
			onFormSubmit();
		}
	}
	let inputKind: string;
	let inputPubkey: string;
	let inputId: string = '';

	const constKind = naddrVaridKind.hasOwnProperty(kind)
		? naddrVaridKind[kind]
		: undefined;

	let disabled: boolean = naddrVaridKind.hasOwnProperty(kind);

	inputKind = constKind !== undefined ? constKind[0].toString() : '';

	function onClickCheck() {
		console.log(inputKind);
		console.log(inputPubkey);
		try {
			if (inputId === '') {
				throw Error();
			}
			const tmp =
				inputPubkey && inputPubkey.startsWith('npub')
					? inputPubkey
					: nip19.npubEncode(inputPubkey);
			const hexpub = nip19.decode(tmp).data as string;
			const addressPointer: nip19.AddressPointer = {
				identifier: inputId,
				pubkey: hexpub,
				kind: Number(inputKind)
			};
			const naddr = nip19.naddrEncode(addressPointer);
			//えらーでなかったらOK
			res.tag = ['a', `${inputKind}:${hexpub}:${inputId}`];
			onFormSubmit();
		} catch (error) {
			const t = {
				message: `${$_('toast.checkInput')}`,
				timeout: 3000,
				background: 'bg-orange-500 text-white width-filled '
			};

			toastStore.trigger(t);
		}
	}
	let openaddr: boolean = false;
</script>

{#if selectItem === myValue}
	<article class="body pt-4">
		<button on:click={() => (openaddr = !openaddr)}
			>{openaddr ? '▼' : '▶'}{`add from kind,pubkey,identifier`}
		</button>
	</article>
	{#if openaddr}
		<div>
			<div
				class="input-group input-group-divider grid-cols-[auto_1fr_auto] mt-2"
			>
				<div
					class="input-group-shim w-[2.5rem]"
					style="padding-left: 4px;padding-right: 4px; justify-content: center;"
				>
					kind
				</div>
				<input
					class="input p-1 w-full"
					type="text"
					inputmode="numeric"
					bind:value={inputKind}
					{disabled}
					on:input={() => (inputKind = inputKind.replace(/[^0-9]/g, ''))}
					placeholder="number"
				/>
			</div>

			<div
				class="input-group input-group-divider grid-cols-[auto_1fr_auto] mt-2"
			>
				<div
					class="input-group-shim w-[2.5rem]"
					style="padding-left: 4px;padding-right: 4px; justify-content: center;"
				>
					pub
				</div>
				<input
					class="input p-1"
					type="text"
					bind:value={inputPubkey}
					placeholder="npub1..."
				/>
			</div>

			<div
				class="input-group input-group-divider grid-cols-[auto_1fr_auto] mt-2"
			>
				<div
					class="input-group-shim w-[2.5rem]"
					style="padding-left: 4px;padding-right: 4px; justify-content: center;"
				>
					id
				</div>
				<input
					class="input p-1"
					type="text"
					bind:value={inputId}
					placeholder="..."
				/>
			</div>
		</div>

		<footer class=" gap-2 flex flex-wrap justify-end mt-2">
			<PublicButton
				handleClickPub={() => {
					res.btn = 'pub';
					onClickCheck();
				}}
				{parent}
			/>
			<PrivateButton
				handleClickPrv={() => {
					res.btn = 'prv';
					onClickCheck();
				}}
				{parent}
			/>

			<!-- <button
			class="btn variant-filled-warning {parent.buttonPositive}"
			on:click={() => {
				res.btn = 'prv';
				onClickCheck();
			}}
			disabled={$nowProgress}>Private</button
		>
		<button
			class="btn {parent.buttonPositive}"
			on:click={() => {
				res.btn = 'pub';
				onClickCheck();
			}}
			disabled={$nowProgress}>Public</button
		> -->
		</footer>
	{/if}
{/if}
