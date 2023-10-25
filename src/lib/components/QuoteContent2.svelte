<script lang="ts">
	import type { ModalComponent, ModalSettings } from '@skeletonlabs/skeleton';
	import { modalStore, toastStore } from '$lib/stores/store';
	import { Metadata, Nostr, Text } from 'nosvelte';
	import ModalCopyPubkey from './ModalProfile.svelte';
	import { uniqueTags } from '$lib/functions';
	import { allView, iconView } from '$lib/stores/settings';

	import ModalEventJson from './ModalEventJson.svelte';
	import Content from './Content.svelte';
	import searchIcon from '@material-design-icons/svg/round/search.svg?raw';
	import Search from '$lib/components/Search.svelte';
	import { nip19 } from 'nostr-tools';
	import Ogp from './OGP.svelte';

	export let id: string;
	export let isPageOwner: boolean;

	//-------------------------------プロフィール表示
	const pubkeyModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalCopyPubkey,
		// Add the component properties as key/value pairs
		props: { background: 'bg-red-500' },
		// Provide a template literal for the default component slot
		slot: `<p>Skeleton</p>`
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
		// Pass a reference to your custom component
		ref: ModalEventJson,
		// Add the component properties as key/value pairs
		props: { background: 'bg-red-500' },
		// Provide a template literal for the default component slot
		slot: `<p>Skeleton</p>`
	};

	function handleClickDate(text: Nostr.Event<number>) {
		console.log('click');
		const modal = {
			type: 'component' as const,
			//  flyX: x,
			//  flyY: y,
			title: 'Event Json',
			meta: {
				//    position: `x-${clientX} y-${clientY}`,
				note: text
			},

			component: jsonModalComponent
		};
		modalStore.trigger(modal);
	}

	// async function getEvent(naddr: string) {
	//   const addressPointer = nip19.decode(naddr).data as nip19.AddressPointer;
	//   console.log($naddrStore);
	//   // naddrStoreの内容を確認し、イベントが存在しない場合のみ取得と保存を行う
	//   if (!(naddr in $naddrStore)) {
	//     const relays =
	//       addressPointer.relays && addressPointer.relays.length > 0
	//         ? addressPointer.relays
	//         : RelaysforSearch;
	//     const filter = [
	//       {
	//         authors: [addressPointer.pubkey],
	//         '#d': [addressPointer.identifier],
	//         kinds: [addressPointer.kind],
	//       },
	//     ];
	//     const res = await fetchFilteredEvents(relays, filter);

	//     if (res.length > 0) {
	//       res.sort((a, b) => b.created_at - a.created_at);
	//       // 取得したイベントをnaddrStoreに保存
	//       $naddrStore[naddr] = res[0];
	//     }

	//     return res[0];
	//   }

	//   // naddrStoreに保存されている場合は、そのままの値を返す
	//   return $naddrStore[naddr];
	// }
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
</script>

<div class="card border border-surface-400 px-3 py-2 mt-1">
	<div class="w-full grid grid-rows-[auto_auto] gap-0 h-fix">
		<Text queryKey={[id]} {id} let:text>
			<div slot="loading">
				<div class="grid grid-cols-[auto_1fr] gap-1 flex">
					<div class="flex justify-center items-center h-auto">
						<button
							class="btn m-0 p-1 variant-filled-primary rounded-full"
							on:click={() => {
								onClickSearch({ ids: [id] });
							}}>{@html searchIcon}</button
						>
					</div>
					<div class="text-sm break-all overflow-hidden">
						Loading note... ({id})
					</div>
				</div>
			</div>
			<div slot="error">
				<div class="grid grid-cols-[auto_1fr] gap-1 flex">
					<div class="flex justify-center items-center h-auto">
						<button
							class="btn m-0 p-1 variant-filled-primary rounded-full"
							on:click={() => {
								onClickSearch({ ids: [id] });
							}}>{@html searchIcon}</button
						>
					</div>
					<div class="text-sm break-all overflow-hidden">
						Loading note... ({id})
					</div>
				</div>
			</div>

			<div slot="nodata">
				<div class="grid grid-cols-[auto_1fr] gap-1 flex">
					<div class="flex justify-center items-center h-auto">
						<button
							class="btn m-0 p-1 variant-filled-primary rounded-full"
							on:click={() => {
								onClickSearch({ ids: [id] });
							}}>{@html searchIcon}</button
						>
					</div>
					<div class="text-sm break-all overflow-hidden">
						Loading note... ({id})
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

					<div class="max-h-40 overflow-auto break-all whitespace-pre-wrap">
						<button
							class="text-xs underline decoration-secondary-500"
							on:click={() => {
								handleClickDate(text);
							}}>{new Date(text.created_at * 1000).toLocaleString()}</button
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
								handleClickDate(text);
							}}>{new Date(text.created_at * 1000).toLocaleString()}</button
						>
					</div>
					<div class="max-h-40 overflow-auto break-all whitespace-pre-wrap">
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
					<div class="max-h-40 overflow-auto break-all whitespace-pre-wrap">
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
							}}
							><u
								>{#if JSON.parse(metadata.content).name !== ''}{JSON.parse(
										metadata.content
									).name}
								{:else}
									{nip19.npubEncode(text.pubkey).slice(0, 12)}:{nip19
										.npubEncode(text.pubkey)
										.slice(-4)}
								{/if}</u
							></button
						>
					</div>
					<div class="text-left self-end text-sm wi truncate justify-items-end">
						{#if JSON.parse(metadata.content).display_name}
							{JSON.parse(metadata.content).display_name}
						{/if}
					</div>
					<div class="min-w-max">
						<button
							class="text-xs underline decoration-secondary-500"
							on:click={() => {
								handleClickDate(text);
							}}>{new Date(text.created_at * 1000).toLocaleString()}</button
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
											{tag[tag.length - 1] === 'mention' ? 'mention' : 'to'}[p]
											<button
												class="text-emerald-800 dark:text-blue-400 overflow-hidden text-ellipsis"
												on:click={() => {
													handleClickPubkey(metadata);
												}}>@<u>{JSON.parse(metadata.content).name}</u></button
											>
										</div>
									</Metadata>
								{:else if tag[0] === 'e' || tag[0] === 'q'}
									<Text queryKey={[tag[1]]} id={tag[1]} let:text>
										<div slot="loading">
											<div
												class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
											>
												[e] {tag[1]}
											</div>
										</div>
										<div slot="error">
											<div
												class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
											>
												[e] {tag[1]}
											</div>
										</div>

										<div slot="nodata">
											<div
												class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
											>
												[e] {tag[1]}
											</div>
										</div>

										<div
											class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden"
										>
											[e] <button
												class="text-emerald-800 dark:text-blue-400 overflow-hidden text-ellipsis"
												on:click={() => {
													handleClickDate(text);
												}}
											>
												{#if tags.some((tag) => tag[0] === 'content-warning') && $allView == false}
													{'<content-warning>'}
												{:else}
													{text.content}
												{/if}</button
											>
										</div>
									</Text>
								{:else}
									<div class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden">
										[{tag[0]}]
										{tag[1]}
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				{/await}
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
			</Metadata>
		</Text>
	</div>
</div>
