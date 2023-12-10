<script lang="ts">
	import { checkInputNaddr } from '$lib/nostrFunctions';
	import { _ } from 'svelte-i18n';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { nip19 } from 'nostr-tools';
	import { naddrVaridKind } from '$lib/kind';

	export let res: { btn: string; tag: string[] };
	export let parent: any;
	export let onFormSubmit: any;
	let input: string;
	export let kind;
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
		try {
			if (inputId === '') {
				throw Error();
			}
			const hexpub = nip19.decode(inputPubkey).data as string;
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

<article class="body py-2">
	<button on:click={() => (openaddr = !openaddr)}
		>{openaddr ? '▼' : '▶'}{`add from kind,pubkey,identifier`}
	</button>
</article>
{#if openaddr}
	<div
		class="mt-2 input-group input-group-divider grid-rows-[auto_auto_auto_auto]"
	>
		<div class="input-group-shim">kind</div>
		<input
			class="input p-2 w-full"
			type="text"
			inputmode="numeric"
			bind:value={inputKind}
			{disabled}
			on:input={() => (inputKind = inputKind.replace(/[^0-9]/g, ''))}
			placeholder="number"
		/>
		<div class="input-group-shim">pubkey</div>
		<input
			class="input p-2"
			type="text"
			bind:value={inputPubkey}
			placeholder="npub1..."
		/>

		<div class="input-group-shim">identifier</div>
		<input
			class="input p-2"
			type="text"
			bind:value={inputId}
			on:input={() => (inputId = inputId.replace(/[^a-zA-Z0-9-_]/g, ''))}
			placeholder="..."
		/>
	</div>

	<footer class=" gap-2 flex flex-wrap justify-end mt-2">
		<button
			class="btn variant-filled-warning {parent.buttonPositive}"
			on:click={() => {
				res.btn = 'prv';
				onClickCheck();
			}}>Private</button
		>
		<button
			class="btn {parent.buttonPositive}"
			on:click={() => {
				res.btn = 'pub';
				onClickCheck();
			}}>Public</button
		>
	</footer>
{/if}
