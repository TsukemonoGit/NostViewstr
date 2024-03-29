<script lang="ts">
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { nip19 } from 'nostr-tools';
	import { modalStore, toastStore } from '$lib/stores/store';

	import { Metadata, Nostr, Text } from 'nosvelte';
	import ModalCopyPubkey from '$lib/components/modals/ModalProfile.svelte';
	import { fetchFilteredEvents } from '$lib/nostrFunctions';
	import { uniqueTags } from '$lib/otherFunctions.js';
	import { naddrStore } from '$lib/stores/bookmarkEvents';
	import { MultiMenu, allView, iconView, isMulti } from '$lib/stores/settings';
	import { relaySet } from '$lib/stores/relays';
	import ModalEventJson from './modals/ModalEventJson.svelte';
	import Content from './Content.svelte';

	import Ogp from './OGP.svelte';
	import EventTag from './EventTag.svelte';
	import PubCha from './PubCha.svelte';
	import SearchCard from './SearchCard.svelte';

	export let encodedId: string;

	export let isPageOwner: boolean;
	export let pubkey: string;
	//-------------------------------プロフィール表示
	const pubkeyModalComponent: ModalComponent = {
		ref: ModalCopyPubkey
	};

	function handleClickPubkey(metadata: Nostr.Event<number>) {
		console.log(metadata);

		const modal = {
			type: 'component' as const,
			//  flyX: x,
			//  flyY: y,
			meta: {
				//    position: `x-${clientX} y-${clientY}`,

				metadata: metadata
			},
			component: pubkeyModalComponent
		};
		modalStore.trigger(modal);
	}

	//-------------------------------イベントJSON表示
	const jsonModalComponent: ModalComponent = {
		ref: ModalEventJson
	};

	function handleClickDate(
		text: Nostr.Event<number>,
		tag?: string[] | undefined
	) {
		console.log('click');
		const modal = {
			type: 'component' as const,
			//  flyX: x,
			//  flyY: y,
			title: 'Event Json',
			meta: {
				//    position: `x-${clientX} y-${clientY}`,
				note: text,
				tagArray: tag
			},

			component: jsonModalComponent
		};
		modalStore.trigger(modal);
	}

	async function getEvent(naddr: string) {
		const addressPointer = nip19.decode(naddr).data as nip19.AddressPointer;
		console.log($naddrStore);
		// naddrStoreの内容を確認し、イベントが存在しない場合のみ取得と保存を行う
		if (!(naddr in $naddrStore)) {
			const relays =
				addressPointer.relays && addressPointer.relays.length > 0
					? addressPointer.relays
					: $relaySet[pubkey].searchRelays;
			const filter = [
				{
					authors: [addressPointer.pubkey],
					'#d': [addressPointer.identifier],
					kinds: [addressPointer.kind]
				}
			];
			const res = await fetchFilteredEvents(relays, filter);

			if (res.length > 0) {
				res.sort(
					(a: { created_at: number }, b: { created_at: number }) =>
						b.created_at - a.created_at
				);
				// 取得したイベントをnaddrStoreに保存
				$naddrStore[naddr] = res[0];
			}

			return res[0];
		}

		// naddrStoreに保存されている場合は、そのままの値を返す
		return $naddrStore[naddr];
	}
	const noteId = (encodedId: string) => {
		if (nip19.decode(encodedId).type === 'note') {
			const data = nip19.decode(encodedId).data as string;
			return data;
		} else if (nip19.decode(encodedId).type === 'nevent') {
			const data = nip19.decode(encodedId).data as nip19.EventPointer;
			return data.id;
		} else return '';
	};

	const toArray = (decodeData: nip19.DecodeResult) => {
		if (decodeData.type === 'naddr') {
			const data = decodeData.data as nip19.AddressPointer;
			return ['a', `${data.kind}:${data.pubkey}:${data.identifier}`];
		} else if (decodeData.type === 'note') {
			const data = decodeData.data as string;
			return ['e', data];
		} else if (decodeData.type === 'nevent') {
			const data = decodeData.data as nip19.EventPointer;
			return ['e', data.id];
		} else if (decodeData.type === 'npub') {
			const data = decodeData.data as string;
			return ['p', data];
		} else if (decodeData.type === 'nprofile') {
			const data = decodeData.data as nip19.ProfilePointer;
			return ['p', data.pubkey];
		}
	};
	const nip19DecodeData = (decodeData: string) => {
		const data = decodeData as unknown as nip19.DecodeResult;
		if (data.type === 'naddr') {
			return data.data as nip19.AddressPointer;
		} else if (data.type === 'note') {
			return data.data as string;
		} else if (data.type === 'nevent') {
			return data.data as nip19.EventPointer;
		} else if (data.type === 'npub') {
			return data.data as string;
		} else if (data.type === 'nprofile') {
			return data.data as nip19.ProfilePointer;
		} else if (data.type === 'nsec') {
			return data.data as string;
		} else {
			return data.data as string;
		}
	};
	const nip19Npub = (decodeData: string) => {
		const data = nip19.decode(decodeData);
		return data.data as string;
	};
	const nip19Nprofile = (decodeData: string) => {
		const data = nip19.decode(decodeData);

		return data.data as nip19.ProfilePointer;
	};
	const nip19Naddr = (decodeData: string) => {
		const tmp = nip19.decode(decodeData);
		return tmp.data as nip19.AddressPointer;
	};
</script>

{#if nip19.decode(encodedId).type === 'note' || nip19.decode(encodedId).type === 'nevent'}
	<div class="card border border-surface-400 px-3 py-2 mt-1">
		<div class="w-full grid grid-rows-[auto_auto] gap-0 h-fix">
			<Text queryKey={[noteId(encodedId)]} id={noteId(encodedId)} let:text>
				<div slot="loading">
					<SearchCard
						{isPageOwner}
						filter={{ ids: [noteId(encodedId)] }}
						message={`Loading note... (${noteId(encodedId)})`}
						textSize="text-sm"
					/>
				</div>
				<div slot="error">
					<SearchCard
						{isPageOwner}
						filter={{ ids: [noteId(encodedId)] }}
						message={`Not found (${noteId(encodedId)})`}
						textSize="text-sm"
					/>
				</div>

				<div slot="nodata">
					<SearchCard
						{isPageOwner}
						filter={{ ids: [noteId(encodedId)] }}
						message={`Not found (${noteId(encodedId)})`}
						textSize="text-sm"
					/>
				</div>
				<Metadata
					queryKey={['metadata', text.pubkey]}
					pubkey={text.pubkey}
					let:metadata
				>
					<div slot="loading">
						<div
							class="-mt-0.5 px-2 opacity-60 text-sm verflow-hidden break-all whitespace-pre-wrap"
						>
							{text.pubkey}
						</div>

						<div
							class="max-h-[20em] overflow-auto break-all whitespace-pre-wrap"
						>
							<button
								class="text-xs underline decoration-secondary-500"
								on:click={() => {
									handleClickDate(text, toArray(nip19.decode(encodedId)));
								}}
								>{new Date(text.created_at * 1000).toLocaleString([], {
									year: 'numeric',
									month: '2-digit',
									day: '2-digit',
									hour: '2-digit',
									minute: '2-digit'
								})}</button
							>
							{#if text.kind === 31990}
								<Ogp
									ogp={{
										title: JSON.parse(text.content).name,
										image: JSON.parse(text.content).banner,
										description: JSON.parse(text.content).about,
										favicon: JSON.parse(text.content).picture
									}}
									url={JSON.parse(text.content).website}
								/>
							{:else if text.kind === 40 || text.kind === 41}
								<PubCha event={text} text={text.content} id={text.id} />
							{:else}
								<Content
									text={text.content}
									tag={text.tags}
									id={text.id}
									view={$allView}
									{pubkey}
									{isPageOwner}
								/>
							{/if}
						</div>
					</div>
					<div slot="error">
						<div
							class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
						>
							{text.pubkey}
							<button
								class="text-xs underline decoration-secondary-500"
								on:click={() => {
									handleClickDate(text, toArray(nip19.decode(encodedId)));
								}}
								>{new Date(text.created_at * 1000).toLocaleString([], {
									year: 'numeric',
									month: '2-digit',
									day: '2-digit',
									hour: '2-digit',
									minute: '2-digit'
								})}</button
							>
						</div>
						<div
							class="max-h-[20em] overflow-auto break-all whitespace-pre-wrap"
						>
							{#if text.kind === 31990}
								<Ogp
									ogp={{
										title: JSON.parse(text.content).name,
										image: JSON.parse(text.content).banner,
										description: JSON.parse(text.content).about,
										favicon: JSON.parse(text.content).picture
									}}
									url={JSON.parse(text.content).website}
								/>
							{:else if text.kind === 40 || text.kind === 41}
								<PubCha event={text} text={text.content} id={text.id} />
							{:else}
								<Content
									text={text.content}
									tag={text.tags}
									id={text.id}
									view={$allView}
									{pubkey}
									{isPageOwner}
								/>
							{/if}
						</div>
					</div>
					<div slot="nodata">
						<div
							class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
						>
							{text.pubkey}
						</div>
						<div
							class="max-h-[20em] overflow-auto break-all whitespace-pre-wrap"
						>
							{#if text.kind === 31990}
								<Ogp
									ogp={{
										title: JSON.parse(text.content).name,
										image: JSON.parse(text.content).banner,
										description: JSON.parse(text.content).about,
										favicon: JSON.parse(text.content).picture
									}}
									url={JSON.parse(text.content).website}
								/>
							{:else if text.kind === 40 || text.kind === 41}
								<PubCha event={text} text={text.content} id={text.id} />
							{:else}
								<Content
									text={text.content}
									tag={text.tags}
									id={text.id}
									view={$allView}
									{pubkey}
									{isPageOwner}
								/>{/if}
						</div>
					</div>
					<div class="w-full grid grid-cols-[auto_auto_1fr_auto] gap-1 h-fix">
						<div>
							{#if $iconView && $isMulti !== MultiMenu.Sort}
								{#if JSON.parse(metadata.content).picture}
									<img
										class="h-5 object-contain justify-center"
										src={JSON.parse(metadata.content).picture}
										alt="avatar"
									/>
								{/if}
							{/if}
						</div>

						<div class="truncate wid justify-items-end">
							<button
								class="text-secondary-500 text-sm font-semibold"
								on:click={() => {
									handleClickPubkey(metadata);
								}}>{JSON.parse(metadata.content).name}</button
							>
						</div>
						<div
							class="text-sm text-left self-end wi truncate justify-items-end"
						>
							{#if JSON.parse(metadata.content).display_name}
								{JSON.parse(metadata.content).display_name}
							{/if}
						</div>
						<div class="min-w-max">
							<button
								class="text-xs underline decoration-secondary-500"
								on:click={() => {
									handleClickDate(text, toArray(nip19.decode(encodedId)));
								}}
								>{new Date(text.created_at * 1000).toLocaleString([], {
									year: 'numeric',
									month: '2-digit',
									day: '2-digit',
									hour: '2-digit',
									minute: '2-digit'
								})}</button
							>
						</div>
					</div>
					{#await uniqueTags(text.tags) then tags}
						{#if tags.length > 0}
							<div
								class="max-h-[4em] overflow-y-auto whitespace-nowrap border-s-4 border-s-surface-500/25 dark:border-s-surface-500/50 box-border"
							>
								{#each tags as tag}
									<EventTag {tag} {handleClickDate} {handleClickPubkey} />
								{/each}
							</div>
						{/if}
						<div
							class="max-h-[20em] overflow-auto break-all whitespace-pre-wrap"
						>
							{#if text.kind === 31990}
								<Ogp
									ogp={{
										title: JSON.parse(text.content).name,
										image: JSON.parse(text.content).banner,
										description: JSON.parse(text.content).about,
										favicon: JSON.parse(text.content).picture
									}}
									url={JSON.parse(text.content).website}
								/>
							{:else if text.kind === 40 || text.kind === 41}
								<PubCha event={text} text={text.content} id={text.id} />
							{:else}
								<Content
									text={text.content}
									tag={text.tags}
									id={text.id}
									view={$allView}
									{pubkey}
									{isPageOwner}
								/>{/if}
						</div>
					{/await}
				</Metadata>
			</Text>
		</div>
	</div>
{:else if nip19.decode(encodedId).type === 'npub'}
	<Metadata
		queryKey={['metadata', nip19.decode(encodedId).data]}
		pubkey={nip19Npub(encodedId)}
		let:metadata
	>
		<div slot="loading">
			<div
				class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
			>
				{nip19.decode(encodedId).data}
			</div>
		</div>
		<div slot="error">
			<div
				class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
			>
				{nip19.decode(encodedId).data}
			</div>
		</div>

		<div slot="nodata">
			<div
				class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
			>
				{nip19.decode(encodedId).data}
			</div>
		</div>

		<button
			class="inline-flex text-surface-600 dark:text-surface-300"
			on:click={() => {
				handleClickPubkey(metadata);
			}}
			><u>@{JSON.parse(metadata.content).name}</u>
		</button>
	</Metadata>
{:else if nip19.decode(encodedId).type === 'nprofile'}
	<Metadata
		queryKey={['metadata', nip19Nprofile(encodedId).pubkey]}
		pubkey={nip19Nprofile(encodedId).pubkey}
		let:metadata
	>
		<div slot="loading">
			<div
				class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
			>
				{nip19Nprofile(encodedId).pubkey}
			</div>
		</div>
		<div slot="error">
			<div
				class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
			>
				{nip19Nprofile(encodedId).pubkey}
			</div>
		</div>

		<div slot="nodata">
			<div
				class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
			>
				{nip19Nprofile(encodedId).pubkey}
			</div>
		</div>
		<button
			class="inline-flex text-surface-600 dark:text-surface-300 break-all whitespace-pre-wrap"
			on:click={() => {
				handleClickPubkey(metadata);
			}}
			><u>@{JSON.parse(metadata.content).name}</u>
		</button>
	</Metadata>
{:else if nip19.decode(encodedId).type === 'naddr'}
	<div class="card border border-surface-400 px-3 py-2">
		<Metadata
			queryKey={['metadata', nip19Naddr(encodedId).pubkey]}
			pubkey={nip19Naddr(encodedId).pubkey}
			let:metadata
		>
			<div slot="loading">
				<div
					class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
				>
					{nip19Naddr(encodedId).pubkey}
				</div>
			</div>
			<div slot="error">
				<div
					class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
				>
					{nip19Naddr(encodedId).pubkey}
				</div>
			</div>

			<div slot="nodata">
				<div
					class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
				>
					{nip19Naddr(encodedId).pubkey}
				</div>
			</div>

			<button
				class="inline-flex text-surface-600 dark:text-surface-300 break-all whitespace-pre-wrap"
				on:click={() => {
					handleClickPubkey(metadata);
				}}
				><u>@{JSON.parse(metadata.content).name}</u>
			</button>
		</Metadata>

		{#await getEvent(encodedId)}
			<div
				class=" -mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
			>
				{encodedId}
			</div>
		{:then text}
			{#if text}
				<button
					class="-mt-0.5 ml-2 text-xs underline decoration-secondary-500"
					on:click={() => {
						handleClickDate(text, toArray(nip19.decode(encodedId)));
					}}
					>{new Date(text.created_at * 1000).toLocaleString([], {
						year: 'numeric',
						month: '2-digit',
						day: '2-digit',
						hour: '2-digit',
						minute: '2-digit'
					})}</button
				>

				<div class="w-full grid grid-rows-[auto_auto] gap-0 h-fix">
					{#if text.tags.length > 0}
						<div
							class="max-h-[4em] overflow-y-auto whitespace-nowrap border-s-4 border-s-surface-500/25 dark:border-s-surface-500/50 box-border"
						>
							{#each text.tags as tag}
								<EventTag
									{tag}
									{handleClickDate}
									handleClickPubkey={handleClickDate}
								/>
							{/each}
						</div>
					{/if}
					<div class="max-h-[20em] overflow-auto break-all whitespace-pre-wrap">
						{#if text.kind === 31990}
							<Ogp
								ogp={{
									title: JSON.parse(text.content).name,
									image: JSON.parse(text.content).banner,
									description: JSON.parse(text.content).about,
									favicon: JSON.parse(text.content).picture
								}}
								url={JSON.parse(text.content).website}
							/>
						{:else if text.kind === 40 || text.kind === 41}
							<PubCha event={text} text={text.content} id={text.id} />
						{:else}
							<Content
								text={text.content}
								tag={text.tags}
								id={text.id}
								view={$allView}
								{pubkey}
								{isPageOwner}
							/>
						{/if}
					</div>
				</div>
			{/if}
		{/await}
	</div>
{/if}
