<script lang="ts">
	import type { ModalComponent } from '@skeletonlabs/skeleton';
	import { nip19 } from 'nostr-tools';
	import { modalStore } from '$lib/stores/store';
	import type Nostr from 'nostr-typedef';
	import LatestEvent from './nostrData/LatestEvent.svelte';
	import ModalCopyPubkey from '$lib/components/modals/ModalProfile.svelte';
	import { formatAbsoluteDate, uniqueTags } from '$lib/otherFunctions.js';
	import { allView, iconView } from '$lib/stores/settings';
	import ModalEventJson from './modals/ModalEventJson.svelte';
	import Content from './Content.svelte';

	import Ogp from './OGP.svelte';
	import EventTag from './EventTag.svelte';
	import PubCha from './PubCha.svelte';
	import SearchCard from './SearchCard.svelte';
	import Metadata from './nostrData/Metadata.svelte';
	import Text from './nostrData/Text.svelte';
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
	const getFilter = (naddr: string): Nostr.Filter[] => {
		const addressPointer = nip19.decode(naddr).data as nip19.AddressPointer;
		return [
			{
				authors: [addressPointer.pubkey],
				'#d': [addressPointer.identifier],
				kinds: [addressPointer.kind]
			}
		];
	};

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
						queryKey={[noteId(encodedId)]}
					/>
				</div>
				<div slot="error">
					<SearchCard
						{isPageOwner}
						filter={{ ids: [noteId(encodedId)] }}
						message={`Not found (${noteId(encodedId)})`}
						textSize="text-sm"
						queryKey={[noteId(encodedId)]}
					/>
				</div>

				<div slot="nodata">
					<SearchCard
						{isPageOwner}
						filter={{ ids: [noteId(encodedId)] }}
						message={`Not found (${noteId(encodedId)})`}
						textSize="text-sm"
						queryKey={[noteId(encodedId)]}
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
								}}>{formatAbsoluteDate(text.created_at)}</button
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
								}}>{formatAbsoluteDate(text.created_at)}</button
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
							{#if $iconView}
								{#if JSON.parse(metadata.content).picture}
									<img
										loading="lazy"
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
								}}>{formatAbsoluteDate(text.created_at)}</button
							>
						</div>
					</div>
					{#await uniqueTags(text.tags) then tags}
						{#if tags.length > 0}
							<div
								class="max-h-[4em] overflow-y-auto whitespace-nowrap border-s-4 border-s-surface-500/25 dark:border-s-surface-500/50 box-border"
							>
								{#each tags as tag}
									<EventTag
										{tag}
										{handleClickDate}
										{handleClickPubkey}
										{pubkey}
									/>
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

		<!-- {#await getEvent(encodedId)} -->
		<LatestEvent
			queryKey={['naddr', encodedId]}
			filters={getFilter(encodedId)}
			let:events
		>
			<div
				class=" -mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
				slot="loading"
			>
				{encodedId}
			</div>
			<div
				class=" -mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
				slot="error"
			>
				{encodedId}
			</div>
			<div
				class=" -mt-0.5 px-2 opacity-60 text-sm overflow-hidden break-all whitespace-pre-wrap"
				slot="nodata"
			>
				{encodedId}
			</div>
			<!-- {:then text}
			{#if text} -->

			<button
				class="-mt-0.5 ml-2 text-xs underline decoration-secondary-500"
				on:click={() => {
					handleClickDate(events, toArray(nip19.decode(encodedId)));
				}}>{formatAbsoluteDate(events.created_at)}</button
			>

			<div class="w-full grid grid-rows-[auto_auto] gap-0 h-fix">
				{#if events.tags.length > 0}
					<div
						class="max-h-[4em] overflow-y-auto whitespace-nowrap border-s-4 border-s-surface-500/25 dark:border-s-surface-500/50 box-border"
					>
						{#each events.tags as tag}
							<EventTag
								{tag}
								{handleClickDate}
								handleClickPubkey={handleClickDate}
								{pubkey}
							/>
						{/each}
					</div>
				{/if}
				<div class="max-h-[20em] overflow-auto break-all whitespace-pre-wrap">
					{#if events.kind === 31990}
						<Ogp
							ogp={{
								title: JSON.parse(events.content).name,
								image: JSON.parse(events.content).banner,
								description: JSON.parse(events.content).about,
								favicon: JSON.parse(events.content).picture
							}}
							url={JSON.parse(events.content).website}
						/>
					{:else if events.kind === 40 || events.kind === 41}
						<PubCha event={events} text={events.content} id={events.id} />
					{:else}
						<Content
							text={events.content}
							tag={events.tags}
							id={events.id}
							view={$allView}
							{pubkey}
							{isPageOwner}
						/>
					{/if}
				</div>
			</div>
			<!-- {/if}
		{/await} -->
		</LatestEvent>
	</div>
{/if}
