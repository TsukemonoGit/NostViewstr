<script lang="ts">
	import { pubkey_viewer, iconView } from '$lib/stores/settings';
	import { modalStore } from '$lib/stores/store';
	import ModalProfile from '$lib/components/modals/ModalProfile.svelte';

	import LocationHomeIcon from '@material-design-icons/svg/round/person.svg?raw';
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { nip19 } from 'nostr-tools';
	import { Metadata, Nostr } from 'nosvelte';

	export let pubkey: string;

	const metadataContentCheck = async (metadata: Nostr.Event) => {
		try {
			return JSON.parse(metadata.content);
		} catch (error) {
			return { picture: '', name: '' };
		}
	};

	//-------------------------------プロフィール表示
	const profileModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalProfile
	};

	const OpenProfile = (metadata: { pubkey: string } | Event) => {
		const modal: ModalSettings = {
			type: 'component',
			backdropClasses: '!bg-surface-400/80',
			meta: {
				metadata: metadata
			},
			component: profileModalComponent,
			response: (res: { openList?: boolean; kind: number }) => {
				// if (res && res.openList) {
				// 	$listNum = 0;
				// 	console.log(res);
				// 	console.log(
				// 		`${window.location.origin}/${nip19.npubEncode(metadata.pubkey)}/${
				// 			res.kind
				// 		}`
				// 	);
				// 	goto(
				// 		`${window.location.origin}/${nip19.npubEncode(metadata.pubkey)}/${
				// 			res.kind
				// 		}`
				// 	);
				// }
			}
		};

		modalStore.trigger(modal);
	};
</script>

<!---->
<div
	class="w-8 h-8 rounded-full flex justify-center overflow-hidden bg-surface-400 mt-1 items-center truncate text-sm"
>
	<Metadata queryKey={['metadata', pubkey]} {pubkey} let:metadata>
		<button
			slot="loading"
			on:click={() => {
				OpenProfile({ pubkey: pubkey });
			}}
		>
			{#if pubkey === $pubkey_viewer}
				<span class="fill-white">{@html LocationHomeIcon}</span>
			{/if}
		</button>
		<button
			slot="error"
			on:click={() => {
				OpenProfile({ pubkey: pubkey });
			}}
		>
			{#if pubkey === $pubkey_viewer}
				<span class="fill-white">{@html LocationHomeIcon}</span>
			{/if}
		</button>
		<button
			slot="nodata"
			on:click={() => {
				OpenProfile({ pubkey: pubkey });
			}}
		>
			{#if pubkey === $pubkey_viewer}
				<span class="fill-white">{@html LocationHomeIcon}</span>
			{/if}
		</button>

		{#await metadataContentCheck(metadata)}
			{#if pubkey === $pubkey_viewer}
				<button
					class="fill-white"
					on:click={() => {
						OpenProfile({ pubkey: pubkey });
					}}>{@html LocationHomeIcon}</button
				>
			{/if}
		{:then metadataContent}
			<button
				on:click={() => {
					OpenProfile(metadata);
				}}
			>
				{#if $iconView && metadataContent.picture !== ''}
					<img
						class="max-w-8 max-h-8 object-contain justify-center"
						src={metadataContent.picture}
						alt="avatar"
					/>
				{:else if metadataContent.name !== ''}
					{metadataContent.name}
				{:else if pubkey === $pubkey_viewer}
					<span class="fill-white">{@html LocationHomeIcon}</span>
				{/if}
			</button>
		{/await}
	</Metadata>
</div>

<!---->
