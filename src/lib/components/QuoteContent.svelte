<script lang="ts">
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { nip19 } from 'nostr-tools';
	import { modalStore, toastStore } from '$lib/stores/store';

	import { Metadata, Nostr, Text } from 'nosvelte';
	import ModalCopyPubkey from '$lib/components/modals/ModalProfile.svelte';
	import { fetchFilteredEvents } from '$lib/nostrFunctions';
	import { uniqueTags } from '$lib/otherFunctions.js';
	import { naddrStore } from '$lib/stores/bookmarkEvents';
	import { allView, iconView } from '$lib/stores/settings';
	import { searchRelays } from '$lib/stores/relays';
	import ModalEventJson from './modals/ModalEventJson.svelte';
	import Content from './Content.svelte';
	import searchIcon from '@material-design-icons/svg/round/search.svg?raw';
	import Search from '$lib/components/Search.svelte';
	import Ogp from './OGP.svelte';

	export let encodedId: string;

	export let isPageOwner: boolean;

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
					: $searchRelays;
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

	//-----------------------------------------------
	const searchModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: Search,
		// Add the component properties as key/value pairs
		props: { background: 'bg-red-500' },
		// Provide a template literal for the default component slot
		slot: `<p>Skeleton</p>`
	};
	function onClickSearch(filter: {}) {
		console.log('search');

		const modal: ModalSettings = {
			type: 'component',
			component: searchModalComponent,
			title: 'Search',
			body: ``,
			value: {
				filter: filter,
				isPageOwner: isPageOwner
			},
			response: async (res) => {
				console.log(res);
				if (res) {
				}
			}
		};
		modalStore.trigger(modal);
	}

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
		const data = nip19DecodeData as unknown as nip19.DecodeResult;
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
		const data = nip19DecodeData as unknown as nip19.DecodeResult;
		return data.data as string;
	};
	const nip19Nprofile = (decodeData: string) => {
		const data = nip19DecodeData as unknown as nip19.DecodeResult;

		return data.data as nip19.ProfilePointer;
	};
	const nip19Naddr = (decodeData: string) => {
		const data = nip19DecodeData as unknown as nip19.DecodeResult;

		return data.data as nip19.AddressPointer;
	};
</script>

{#if nip19.decode(encodedId).type === 'note' || nip19.decode(encodedId).type === 'nevent'}
	<div class="card border border-surface-400 px-3 py-2 mt-1">
		<div class="w-full grid grid-rows-[auto_auto] gap-0 h-fix">
			<Text queryKey={[noteId(encodedId)]} id={noteId(encodedId)} let:text>
				<div slot="loading">
					<div class="grid grid-cols-[auto_1fr] gap-1 flex">
						<div class="flex justify-center items-center h-auto">
							<button
								class="btn m-0 p-1 variant-filled-secondary rounded-full"
								on:click={() => {
									console.log('test');
									//   if (isPageOwner) {
									onClickSearch({ ids: [noteId(encodedId)] });
									// } else {
									//   window.open(
									//     'https://koteitan.github.io/nostr-post-checker/?eid=' +
									//       nip19.noteEncode(noteId(encodedId)),
									//     '_blank',
									//   );
									// }
								}}>{@html searchIcon}</button
							>
						</div>
						<div
							class="text-sm break-all overflow-hidden break-all whitespace-pre-wrap"
						>
							Loading note... ({noteId(encodedId)})
						</div>
					</div>
				</div>
				<div slot="error">
					<div class="grid grid-cols-[auto_1fr] gap-1 flex">
						<div class="flex justify-center items-center h-auto">
							<button
								class="btn m-0 p-1 variant-filled-secondary rounded-full"
								on:click={() => {
									console.log('test');
									// if (isPageOwner) {
									onClickSearch({ ids: [noteId(encodedId)] });
									// } else {
									//   window.open(
									//     'https://koteitan.github.io/nostr-post-checker/?eid=' +
									//       nip19.noteEncode(noteId(encodedId)),
									//     '_blank',
									//   );
									// }
								}}>{@html searchIcon}</button
							>
						</div>
						<div
							class="text-sm break-all overflow-hidden break-all whitespace-pre-wrap"
						>
							Failed to get note ({noteId(encodedId)})
						</div>
					</div>
				</div>

				<div slot="nodata">
					<div class="grid grid-cols-[auto_1fr] gap-1 flex">
						<div class="flex justify-center items-center h-auto">
							<button
								class="btn m-0 p-1 variant-filled-secondary rounded-full"
								on:click={() => {
									console.log('test');
									// if (isPageOwner) {
									onClickSearch({ ids: [noteId(encodedId)] });
									// } else {
									//   window.open(
									//     'https://koteitan.github.io/nostr-post-checker/?eid=' +
									//       nip19.noteEncode(noteId(encodedId)),
									//     '_blank',
									//   );
									// }
								}}>{@html searchIcon}</button
							>
						</div>
						<div
							class="text-sm break-all overflow-hidden break-all whitespace-pre-wrap"
						>
							Note not found ({noteId(encodedId)})
						</div>
					</div>
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
							{:else}
								<Content
									text={text.content}
									tag={text.tags}
									id={text.id}
									view={$allView}
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
							{:else}
								<Content
									text={text.content}
									tag={text.tags}
									id={text.id}
									view={$allView}
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
							{:else}
								<Content
									text={text.content}
									tag={text.tags}
									id={text.id}
									view={$allView}
									{isPageOwner}
								/>{/if}
						</div>
					</div>
					<div class="w-full grid grid-cols-[auto_auto_1fr_auto] gap-1 h-fix">
						<div>
							{#if $iconView}
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
								class="text-emerald-800 dark:text-blue-500 text-sm"
								on:click={() => {
									handleClickPubkey(metadata);
								}}><u>{JSON.parse(metadata.content).name}</u></button
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
								class="max-h-[4em] overflow-auto whitespace-nowrap border-s-4 border-s-rose-800/25 dark:border-s-rose-100/25"
							>
								{#each tags as tag}
									{#if tag[0] === 'p'}
										<Metadata
											queryKey={['metadata', tag[1]]}
											pubkey={tag[1]}
											let:metadata
										>
											<div slot="loading">
												<div
													class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
												>
													{tag[tag.length - 1] === 'mention'
														? 'mention'
														: 'to'}[p] {tag[1]}
												</div>
											</div>
											<div slot="error">
												<div
													class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
												>
													{tag[tag.length - 1] === 'mention'
														? 'mention'
														: 'to'}[p] {tag[1]}
												</div>
											</div>

											<div slot="nodata">
												<div
													class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
												>
													{tag[tag.length - 1] === 'mention'
														? 'mention'
														: 'to'}[p] {tag[1]}
												</div>
											</div>
											<div
												class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
											>
												{tag[tag.length - 1] === 'mention'
													? 'mention'
													: 'to'}[p]
												<button
													class="text-emerald-800 dark:text-blue-400 overflow-hidden text-ellipsis"
													on:click={() => {
														handleClickPubkey(metadata);
													}}><u>{JSON.parse(metadata.content).name}</u></button
												>
											</div>
										</Metadata>
									{:else if tag[0] === 'e' || tag[0] === 'q'}
										<Text queryKey={[tag[1]]} id={tag[1]} let:text>
											<div slot="loading">
												<div
													class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
												>
													[{tag[0]}] {tag[1]}
												</div>
											</div>
											<div slot="error">
												<div
													class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
												>
													[{tag[0]}] {tag[1]}
												</div>
											</div>

											<div slot="nodata">
												<div
													class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
												>
													[{tag[0]}] {tag[1]}
												</div>
											</div>

											<div
												class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
											>
												[{tag[0]}]
												<button
													class="text-emerald-800 dark:text-blue-400 overflow-hidden text-ellipsis"
													on:click={() => {
														handleClickDate(
															text,
															toArray(nip19.decode(encodedId))
														);
													}}
													>{#if tags.some((tag) => tag[0] === 'content-warning') && $allView == false}
														{'<content-warning>'}
													{:else}
														{text.content}
													{/if}</button
												>
											</div>
										</Text>
									{:else}
										<div
											class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
										>
											[{tag[0]}]
											{tag[1]}
										</div>
									{/if}
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
							{:else}
								<Content
									text={text.content}
									tag={text.tags}
									id={text.id}
									view={$allView}
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
			class="inline-flex text-gray-800/80 dark:text-gray-200/80"
			on:click={() => {
				handleClickPubkey(metadata);
			}}
			><u>{JSON.parse(metadata.content).name}</u>
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
				class="-mt-0.5 px-2 opacity-60 text-sm whitespace-nowrap overflow-hidden break-all whitespace-pre-wrap"
			>
				{nip19Nprofile(encodedId).pubkey}
			</div>
		</div>
		<div slot="error">
			<div
				class="-mt-0.5 px-2 opacity-60 text-sm whitespace-nowrap overflow-hidden break-all whitespace-pre-wrap"
			>
				{nip19Nprofile(encodedId).pubkey}
			</div>
		</div>

		<div slot="nodata">
			<div
				class="-mt-0.5 px-2 opacity-60 text-sm whitespace-nowrap overflow-hidden break-all whitespace-pre-wrap"
			>
				{nip19Nprofile(encodedId).pubkey}
			</div>
		</div>
		<button
			class="inline-flex text-gray-800/80 dark:text-gray-200/80 break-all whitespace-pre-wrap"
			on:click={() => {
				handleClickPubkey(metadata);
			}}
			><u>{JSON.parse(metadata.content).name}</u>
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
				class="inline-flex text-gray-800/80 dark:text-gray-200/80 break-all whitespace-pre-wrap"
				on:click={() => {
					handleClickPubkey(metadata);
				}}
				><u>{JSON.parse(metadata.content).name}</u>
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
							class="max-h-[4em] overflow-auto whitespace-nowrap border-s-4 border-s-rose-800/25"
						>
							{#each text.tags as tag}
								{#if tag[0] === 'p'}
									<Metadata
										queryKey={['metadata', tag[1]]}
										pubkey={tag[1]}
										let:metadata
									>
										<div
											class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
										>
											to <button
												class="text-emerald-800 dark:text-blue-400 overflow-hidden text-ellipsis"
												on:click={() => {
													handleClickPubkey(metadata);
												}}><u>{JSON.parse(metadata.content).name}</u></button
											>
										</div>
									</Metadata>
								{:else if tag[0] === 'e' || tag[0] === 'q'}
									<Text queryKey={[tag[1]]} id={tag[1]} let:text>
										<div
											class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
										>
											[e] <button
												class="text-emerald-800 dark:text-blue-400 overflow-hidden text-ellipsis"
												on:click={() => {
													handleClickDate(text, tag);
												}}>{text.content}</button
											>
										</div>
									</Text>
								{:else if tag[0] !== 'emoji' && tag[0] !== 'r' && tag[0] !== 't'}
									<div
										class="-mt-0.5 px-2 opacity-60 text-sm whitespace-nowrap overflow-hidden"
									>
										[{tag[0]}]
										{tag[1]}
									</div>
								{/if}
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
						{:else}
							<Content
								text={text.content}
								tag={text.tags}
								id={text.id}
								view={$allView}
								{isPageOwner}
							/>
						{/if}
					</div>
				</div>
			{/if}
		{/await}
	</div>
{/if}
