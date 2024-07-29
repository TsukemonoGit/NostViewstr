<script lang="ts">
	import { _ } from 'svelte-i18n';
	import EventCard from '$lib/components/EventCard.svelte';
	import { ogpDescription } from '$lib/otherFunctions.js';

	import { nip19 } from 'nostr-tools';
	import { parseNaddr } from '$lib/nostrFunctions';
	import SearchCard from './SearchCard.svelte';

	import ProfileCard from './ProfileCard.svelte';
	import Emoji from './Emoji.svelte';

	import Relay from './Relay.svelte';
	import Other from './Other.svelte';
	import Reference from '$lib/components/Reference.svelte';
	import Hashtag from './Hashtag.svelte';
	import OGP from './OGP.svelte';

	import MenuByType from './MenuByType.svelte';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import type { SelectIndex } from '$lib/otherFunctions';
	import Metadata from './nostrData/Metadata.svelte';
	import Text from './nostrData/Text.svelte';
	import LatestEvent from './nostrData/LatestEvent.svelte';
	import { relaySet } from '$lib/stores/relays';
	import { afterNavigate } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	export let tag: {
		id: number;
		name: string[];
	};
	export let id: string;
	export let popupCombobox: PopupSettings;
	export let filter: {};
	export let isOwner: boolean;
	export let pubkey: string;
	export let selectedIndex: SelectIndex;
	export let kind: number | undefined;
	//export let handleClick: any;

	let showText: boolean = false;
	let isMount = false;
	export let CheckNote: (e: SelectIndex) => void;
	onMount(() => {
		showText = false;
		if (!isMount) {
			isMount = true;
			init();
		}
	});
	afterNavigate(() => {
		showText = false;
		if (!isMount) {
			isMount = true;
			init();
		}
	});
	let timeoutId: NodeJS.Timeout | undefined;

	function init() {
		timeoutId = setTimeout(() => {
			showText = true;
			isMount = false;
		}, 500); // 0.5秒後に表示(初回読み込み時にデータがぶあーってきたときに一瞬だけ表示されたページのイベントの読み込みが発生しないようにしてみる)

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId); // ページが変わった場合にタイマーをクリア
			}
		};
	}
	onDestroy(() => {
		if (timeoutId) {
			clearTimeout(timeoutId); // ページが変わった場合にタイマーをクリア
		}
	});
</script>

{#if showText}
	{#if tag.name[0] === 'e'}
		<!-- {#if $searchRelays && $searchRelays.length > 0}
					<NostrApp relays={$searchRelays}> -->
		<Text
			queryKey={[id]}
			{id}
			let:text
			relay={tag.name.length > 2 && tag.name[2] !== ''
				? [...new Set([...$relaySet[pubkey]?.mergeRelays, tag.name[2]])]
				: undefined}
		>
			<div
				slot="loading"
				class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
			>
				<SearchCard
					{filter}
					message={`loading [${tag.name}]`}
					isPageOwner={isOwner}
					queryKey={[id]}
				/>
				<MenuByType
					setSelectedIndex={{
						detail: {
							number: tag.id,
							event: undefined,
							tagArray: tag.name
						}
					}}
					{popupCombobox}
					bind:selectedIndex
					{CheckNote}
				/>
			</div>
			<div
				slot="error"
				class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
			>
				<SearchCard
					{filter}
					message={`error [${tag.name}]`}
					isPageOwner={isOwner}
					queryKey={[id]}
				/>
				<MenuByType
					setSelectedIndex={{
						detail: {
							number: tag.id,
							event: undefined,
							tagArray: tag.name
						}
					}}
					{popupCombobox}
					bind:selectedIndex
					{CheckNote}
				/>
			</div>
			<div
				slot="nodata"
				class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
			>
				<SearchCard
					{filter}
					message={`not found [${tag.name}]`}
					isPageOwner={isOwner}
					queryKey={[id]}
				/>
				<MenuByType
					setSelectedIndex={{
						detail: {
							number: tag.id,
							event: undefined,
							tagArray: tag.name
						}
					}}
					{popupCombobox}
					bind:selectedIndex
					{CheckNote}
				/>
			</div>

			<Metadata
				queryKey={['metadata', text.pubkey]}
				pubkey={text.pubkey}
				let:metadata
				relay={tag.name.length > 2 && tag.name[2] !== ''
					? [...new Set([...$relaySet[pubkey]?.mergeRelays, tag.name[2]])]
					: undefined}
			>
				<div
					slot="loading"
					class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
				>
					<EventCard
						isPageOwner={isOwner}
						tagArray={tag.name}
						note={text}
						metadata={undefined}
						{pubkey}
					/>
					<MenuByType
						setSelectedIndex={{
							detail: {
								number: tag.id,
								event: text,
								tagArray: tag.name
							}
						}}
						{popupCombobox}
						bind:selectedIndex
						{CheckNote}
					/>
				</div>
				<div
					slot="error"
					class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
				>
					<EventCard
						isPageOwner={isOwner}
						tagArray={tag.name}
						note={text}
						metadata={undefined}
						{pubkey}
					/>
					<MenuByType
						setSelectedIndex={{
							detail: {
								number: tag.id,
								event: text,
								tagArray: tag.name
							}
						}}
						{popupCombobox}
						bind:selectedIndex
						{CheckNote}
					/>
				</div>
				<div
					slot="nodata"
					class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
				>
					<EventCard
						isPageOwner={isOwner}
						tagArray={tag.name}
						note={text}
						metadata={undefined}
						{pubkey}
					/>
					<MenuByType
						setSelectedIndex={{
							detail: {
								number: tag.id,
								event: text,
								tagArray: tag.name
							}
						}}
						{popupCombobox}
						bind:selectedIndex
						{CheckNote}
					/>
				</div>
				<div
					class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
				>
					<EventCard
						isPageOwner={isOwner}
						tagArray={tag.name}
						note={text}
						{metadata}
						{pubkey}
					/>
					<MenuByType
						setSelectedIndex={{
							detail: {
								number: tag.id,
								event: text,
								tagArray: tag.name
							}
						}}
						{popupCombobox}
						bind:selectedIndex
						{CheckNote}
					/>
				</div>
			</Metadata>
		</Text>
	{:else if tag.name[0] === 'a'}
		<!-- {#if $searchRelays && $searchRelays.length > 0}
					<NostrApp relays={$searchRelays}> -->
		<LatestEvent queryKey={[tag.name[1]]} filters={[filter]} let:events>
			<div
				slot="loading"
				class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
			>
				{#if kind && kind === 30023}<!--long form content-->
					<OGP
						ogp={{
							title: 'Long Form Content',
							image: '',
							description:
								'open in habla' + ogpDescription(parseNaddr(tag.name)),
							favicon: 'https://habla.news/favicon.png'
						}}
						url={'https://habla.news/a/\n' +
							nip19.naddrEncode(parseNaddr(tag.name))}
					/>
					<!---->
				{:else if kind && kind === 34550}<!--communities-->
					<OGP
						ogp={{
							title: 'Communities',
							image: '',
							description:
								'open in habla\n' + ogpDescription(parseNaddr(tag.name)),
							favicon: 'https://habla.news/favicon.png'
						}}
						url={'https://habla.news/c/' +
							nip19.naddrEncode(parseNaddr(tag.name))}
					/>
				{:else}
					<SearchCard
						{filter}
						message={`loading [${tag.name}]`}
						isPageOwner={isOwner}
						queryKey={tag.name}
					/>
				{/if}
				<MenuByType
					setSelectedIndex={{
						detail: {
							number: tag.id,
							event: undefined,
							tagArray: tag.name
						}
					}}
					{popupCombobox}
					bind:selectedIndex
					{CheckNote}
				/>
			</div>
			<div
				slot="error"
				class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
			>
				{#if kind && kind === 30023}
					<OGP
						ogp={{
							title: 'Long Form Content',
							image: '',
							description:
								'open in habla\n' + ogpDescription(parseNaddr(tag.name)),
							favicon: 'https://habla.news/favicon.png'
						}}
						url={'https://habla.news/a/' +
							nip19.naddrEncode(parseNaddr(tag.name))}
					/>
					<!---->
				{:else if kind && kind === 34550}<!--communities-->
					<OGP
						ogp={{
							title: 'Communities',
							image: '',
							description:
								'open in habla\n' + ogpDescription(parseNaddr(tag.name)),
							favicon: 'https://habla.news/favicon.png'
						}}
						url={'https://habla.news/c/' +
							nip19.naddrEncode(parseNaddr(tag.name))}
					/>
				{:else}
					<SearchCard
						{filter}
						message={`error [${tag.name}]`}
						isPageOwner={isOwner}
						queryKey={tag.name}
					/>
				{/if}
				<MenuByType
					setSelectedIndex={{
						detail: {
							number: tag.id,
							event: undefined,
							tagArray: tag.name
						}
					}}
					{popupCombobox}
					bind:selectedIndex
					{CheckNote}
				/>
			</div>
			<div
				slot="nodata"
				class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
			>
				{#if kind && kind === 30023}
					<OGP
						ogp={{
							title: 'Long Form Content',
							image: '',
							description:
								'open in habla\n' + ogpDescription(parseNaddr(tag.name)),
							favicon: 'https://habla.news/favicon.png'
						}}
						url={'https://habla.news/a/' +
							nip19.naddrEncode(parseNaddr(tag.name))}
					/>
					<!---->
				{:else if kind && kind === 34550}<!--communities-->
					<OGP
						ogp={{
							title: 'Communities',
							image: '',
							description:
								'open in habla\n' + ogpDescription(parseNaddr(tag.name)),
							favicon: 'https://habla.news/favicon.png'
						}}
						url={'https://habla.news/c/' +
							nip19.naddrEncode(parseNaddr(tag.name))}
					/>
				{:else}
					<SearchCard
						{filter}
						message={`not found [${tag.name}]`}
						isPageOwner={isOwner}
						queryKey={tag.name}
					/>
				{/if}
				<MenuByType
					setSelectedIndex={{
						detail: {
							number: tag.id,
							event: undefined,
							tagArray: tag.name
						}
					}}
					{popupCombobox}
					bind:selectedIndex
					{CheckNote}
				/>
			</div>

			<Metadata
				queryKey={['metadata', events.pubkey]}
				pubkey={events.pubkey}
				let:metadata
				relay={tag.name.length > 2 && tag.name[2] !== ''
					? [...new Set([...$relaySet[pubkey]?.mergeRelays, tag.name[2]])]
					: undefined}
			>
				<div
					slot="loading"
					class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
				>
					<EventCard
						isPageOwner={isOwner}
						tagArray={tag.name}
						note={events}
						metadata={undefined}
						{pubkey}
					/>
					<MenuByType
						setSelectedIndex={{
							detail: {
								number: tag.id,
								event: events,
								tagArray: tag.name
							}
						}}
						{popupCombobox}
						bind:selectedIndex
						{CheckNote}
					/>
				</div>
				<div
					slot="error"
					class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
				>
					<EventCard
						isPageOwner={isOwner}
						tagArray={tag.name}
						note={events}
						metadata={undefined}
						{pubkey}
					/><MenuByType
						setSelectedIndex={{
							detail: {
								number: tag.id,
								event: events,
								tagArray: tag.name
							}
						}}
						{popupCombobox}
						bind:selectedIndex
						{CheckNote}
					/>
				</div>
				<div
					slot="nodata"
					class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
				>
					<EventCard
						isPageOwner={isOwner}
						tagArray={tag.name}
						note={events}
						metadata={undefined}
						{pubkey}
					/><MenuByType
						setSelectedIndex={{
							detail: {
								number: tag.id,
								event: events,
								tagArray: tag.name
							}
						}}
						{popupCombobox}
						bind:selectedIndex
						{CheckNote}
					/>
				</div>
				<div
					class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
				>
					<EventCard
						isPageOwner={isOwner}
						tagArray={tag.name}
						note={events}
						{metadata}
						{pubkey}
					/>
					<MenuByType
						setSelectedIndex={{
							detail: {
								number: tag.id,
								event: events,
								tagArray: tag.name
							}
						}}
						{popupCombobox}
						bind:selectedIndex
						{CheckNote}
					/>
				</div>
			</Metadata>
		</LatestEvent>
	{:else if tag.name[0] === 'p'}
		<Metadata
			queryKey={['metadata', tag.name[1]]}
			pubkey={tag.name[1]}
			let:metadata
			relay={tag.name.length > 2 && tag.name[2] !== ''
				? [...new Set([...$relaySet[pubkey]?.mergeRelays, tag.name[2]])]
				: undefined}
		>
			<div
				slot="loading"
				class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1 break-all"
			>
				<SearchCard
					{filter}
					message={`loading [${tag.name}]`}
					isPageOwner={isOwner}
					queryKey={['metadata', tag.name[1]]}
				/>

				<!-- loading ... {JSON.stringify(tag.name)} -->
				<MenuByType
					setSelectedIndex={{
						detail: {
							number: tag.id,
							event: undefined,
							tagArray: tag.name
						}
					}}
					{popupCombobox}
					bind:selectedIndex
					{CheckNote}
				/>
			</div>
			<div
				slot="error"
				class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1 break-all"
			>
				<SearchCard
					{filter}
					message={`not found [${tag.name}]`}
					isPageOwner={isOwner}
					queryKey={['metadata', tag.name[1]]}
				/>
				<MenuByType
					setSelectedIndex={{
						detail: {
							number: tag.id,
							event: undefined,
							tagArray: tag.name
						}
					}}
					{popupCombobox}
					bind:selectedIndex
					{CheckNote}
				/>
			</div>
			<div
				slot="nodata"
				class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1 break-all"
			>
				<SearchCard
					{filter}
					message={`not found [${tag.name}]`}
					isPageOwner={isOwner}
					queryKey={['metadata', tag.name[1]]}
				/>
				<MenuByType
					setSelectedIndex={{
						detail: {
							number: tag.id,
							event: undefined,
							tagArray: tag.name
						}
					}}
					{popupCombobox}
					bind:selectedIndex
					{CheckNote}
				/>
			</div>
			<div
				class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto] gap-1"
			>
				<ProfileCard {metadata} tagArray={tag.name} />
				<MenuByType
					setSelectedIndex={{
						detail: {
							number: tag.id,
							event: metadata,
							tagArray: tag.name
						}
					}}
					{popupCombobox}
					bind:selectedIndex
					{CheckNote}
				/>
			</div>
		</Metadata>
	{:else if tag.name[0] === 'emoji'}
		<!--えもじ-->
		<div
			class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1"
		>
			<Emoji tagArray={tag.name} />
			<!-- {#if isOwner && !$isMulti}
			<button
				class="btn p-2 fill-surface-600 dark:fill-surface-300"
				on:click={() => {
					handleClick(tag.id, tag.name);
				}}>{@html EditIcon}</button
			>
		{/if} -->
			<MenuByType
				setSelectedIndex={{
					detail: {
						number: tag.id,
						event: undefined,
						tagArray: tag.name,
						editable: isOwner
					}
				}}
				{popupCombobox}
				bind:selectedIndex
				{CheckNote}
			/>
		</div>
	{:else if (tag.name[0] === 'r' && tag.name.length > 1 && tag.name[1].startsWith('ws')) || tag.name[0] === 'relay'}
		<!--りれー-->
		<div
			class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1 break-all"
		>
			<Relay tagArray={tag.name} />
			<!-- {#if isOwner && $isMulti === MultiMenu.None}
			<button
				class="btn p-2 fill-surface-600 dark:fill-surface-300"
				on:click={() => {
					handleClick(tag.id, tag.name);
				}}>{@html EditIcon}</button
			>
		{/if} -->
			<MenuByType
				setSelectedIndex={{
					detail: {
						number: tag.id,
						event: undefined,
						tagArray: tag.name,
						editable: isOwner
					}
				}}
				{popupCombobox}
				bind:selectedIndex
				{CheckNote}
			/>
		</div>
	{:else if tag.name[0] === 'r'}
		<div
			class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1 break-all"
		>
			<Reference tagArray={tag.name} />
			<!-- {#if isOwner && $isMulti === MultiMenu.None}
			<button
				class="btn p-2 fill-surface-600 dark:fill-surface-300"
				on:click={() => {
					handleClick(tag.id, tag.name);
				}}>{@html EditIcon}</button
			>
		{/if} -->
			<MenuByType
				setSelectedIndex={{
					detail: {
						number: tag.id,
						event: undefined,
						tagArray: tag.name,
						editable: isOwner
					}
				}}
				{popupCombobox}
				bind:selectedIndex
				{CheckNote}
			/>
		</div>
	{:else if tag.name[0] === 't'}
		<!--はっしゅたぐ-->

		<div
			class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1 break-all"
		>
			<Hashtag tagArray={tag.name} />
			<!-- {#if isOwner && $isMulti === MultiMenu.None}
			<button
				class="btn p-2 fill-surface-600 dark:fill-surface-300"
				on:click={() => {
					handleClick(tag.id, tag.name);
				}}>{@html EditIcon}</button
			>
		{/if} -->
			<MenuByType
				setSelectedIndex={{
					detail: {
						number: tag.id,
						event: undefined,
						tagArray: tag.name,
						editable: isOwner
					}
				}}
				{popupCombobox}
				bind:selectedIndex
				{CheckNote}
			/>
		</div>
	{:else if tag.name[0] === 'word'}
		<!--word-->

		<div
			class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1 break-all"
		>
			<Other tagArray={tag.name} />
			<!-- {#if isOwner && $isMulti === MultiMenu.None}
			<button
				class="btn p-2 fill-surface-600 dark:fill-surface-300"
				on:click={() => {
					handleClick(tag.id, tag.name);
				}}>{@html EditIcon}</button
			>
		{/if} -->
			<MenuByType
				setSelectedIndex={{
					detail: {
						number: tag.id,
						event: undefined,
						tagArray: tag.name,
						editable: isOwner
					}
				}}
				{popupCombobox}
				bind:selectedIndex
				{CheckNote}
			/>
		</div>
	{:else}
		<!--a,e,d,emoji,relay,r,t,word以外-->

		<div
			class="z-0 card drop-shadow px-1 py-1 my-0.5 grid grid-cols-[1fr_auto_auto] gap-1 break-all"
		>
			{JSON.stringify(tag.name)}
			<!-- {#if isOwner && $isMulti === MultiMenu.None}
			<button
				class="btn p-2 fill-surface-600 dark:fill-surface-300"
				on:click={() => {
					handleClick(tag.id, tag.name);
				}}>{@html EditIcon}</button
			>
		{/if} -->
			<MenuByType
				setSelectedIndex={{
					detail: {
						number: tag.id,
						event: undefined,
						tagArray: tag.name,
						editable: isOwner
					}
				}}
				{popupCombobox}
				bind:selectedIndex
				{CheckNote}
			/>
		</div>
	{/if}
{/if}
