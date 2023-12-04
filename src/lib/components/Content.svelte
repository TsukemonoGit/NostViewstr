<script lang="ts">
	import { extractTextParts, type TextPart } from '$lib/content';
	import type { ModalComponent } from '@skeletonlabs/skeleton';
	import { modalStore, toastStore } from '$lib/stores/store';
	import ModalImage from '$lib/components/modals/ModalImage.svelte';
	import { nip19 } from 'nostr-tools';

	import { Metadata, Nostr, NostrApp, Text } from 'nosvelte';
	import ModalCopyPubkey from '$lib/components/modals/ModalProfile.svelte';
	import { getOgp } from '$lib/otherFunctions.js';
	import OGP from './OGP.svelte';
	import { contentStore, ogpStore } from '$lib/stores/bookmarkEvents';
	import { URLPreview } from '$lib/stores/settings';
	import QuoteContent from './QuoteContent.svelte';
	import QuoteContent2 from './QuoteContent2.svelte';
	import { goto } from '$app/navigation';

	export let id: string;
	export let text: string;
	export let tag: string[][];
	export let isPageOwner: boolean;
	export let pubkey: string;
	const imageModalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalImage,
		// Add the component properties as key/value pairs
		props: { background: 'bg-red-500' },
		// Provide a template literal for the default component slot
		slot: `<p>Skeleton</p>`
	};

	function handleClickImage(str: string | undefined) {
		if (typeof str === 'string') {
			const modal = {
				type: 'component' as const,
				image: str,
				component: imageModalComponent
			};
			modalStore.trigger(modal);
		}
	}

	//でこーどできるかちぇっく
	function decodeCheck(str: string): boolean {
		try {
			nip19.decode(str);
			return true;
		} catch (error) {
			return false;
		}
	}

	// URLが存在する場合はストアの値を使用し、ない場合はOGP情報を取得してストアを更新する
	async function loadOgp(url: string) {
		if (!$ogpStore[url] || $ogpStore[url].title === '') {
			try {
				const ogp = await getOgp(url); // OGP情報を取得
				ogpStore.update((store) => {
					// 取得したOGP情報をストアに追加
					return {
						...store,
						[url]: ogp
					};
				});
			} catch (error) {
				console.log(error);
				$ogpStore[url].title = '';
				$ogpStore[url].image = '';
				$ogpStore[url].description = '';
				$ogpStore[url].favicon = '';
			}
		}
	}

	const pathname = (urlstr: string) => {
		const url = new URL(urlstr);

		if (url.hostname === 'youtu.be') {
			return url.pathname.substring(1);
		} else if (
			url.hostname === 'www.youtube.com' ||
			url.hostname === 'm.youtube.com'
		) {
			if (url.pathname.startsWith('/shorts/')) {
				return url.pathname.replace('/shorts/', '');
			} else {
				return getParam('v', urlstr);
			}
		}
	};

	function getParam(name: string, url: string): string | null {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, '\\$&');
		const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
		const results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}

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
			meta: {
				metadata: metadata
			},
			component: pubkeyModalComponent
		};
		modalStore.trigger(modal);
	}

	async function getTextParts(text: string, tag: string[][]) {
		if (id in $contentStore) {
			return $contentStore[id];
		} else {
			const content = await extractTextParts(text, tag);
			$contentStore[id] = content;
			return content;
		}
	}
	export let view = false;
	function clickView() {
		view = true;
	}
	const encodedURL = (str: string): string => {
		//https://github.com/akiomik/nosey
		const encodedstr = encodeURIComponent(str);
		const url = `https://nosey.vercel.app/?q=${encodedstr}`;
		return url;
	};
</script>

{#if tag.some((tag) => tag[0] === 'content-warning') && view == false}
	<button
		type="button"
		class="btn variant-filled-warning m-0"
		on:click={clickView}
	>
		content-warning<br />
		{tag[tag.findIndex((tag) => tag[0] === 'content-warning')][1]}
	</button>
{:else}
	{#await getTextParts(text, tag)}
		{text}
	{:then viewContent}
		{#each viewContent as item, index}
			{#if item.content.length > 0}
				<!-- <div class="break-all  overflow-x-hidden"> -->
				{#if item.type === 'emoji'}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<img
						class="align-bottom inline-flex h-[1.5em] object-contain w-fit -mx-[2.2px]"
						src={item.url}
						alt=""
						on:click={() => handleClickImage(item.url)}
					/>{:else if item.type === 'url'}{#if $URLPreview}{#if new URL(item.content).hostname.endsWith('twitter.com')}
							<div
								class="max-w-full max-h-[24rem] w-[28rem] overflow-auto break-all"
							>
								<blockquote class="twitter-tweet">
									<p lang="ja" dir="ltr">
										<a class="anchor break-all" href={item.content}
											>{item.content}</a
										>
									</p>
								</blockquote>

								<script
									async
									src="https://platform.twitter.com/widgets.js"
									charset="utf-8"
								></script>
							</div>
						{:else if new URL(item.content).hostname === 'www.youtube.com' || new URL(item.content).hostname === 'm.youtube.com' || new URL(item.content).hostname === 'youtu.be'}
							<iframe
								class="rounded max-w-full"
								width="320"
								height="180"
								src={`https://www.youtube.com/embed/${pathname(item.content)}`}
								title="YouTube video player"
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								allowfullscreen
							/>
						{:else if item.content?.endsWith('.mp4') || item.content?.endsWith('.mov')}
							<video controls class="max-h-[20em] max-w-full">
								<source src={item.content} type="video/mp4" />
								<track kind="captions" src="" label="English" default />
								Your browser does not support the video tag.
							</video>
						{:else}
							{#await loadOgp(item.content)}<span class=" break-all"
									><a class="anchor" href={item.content} target="_blank"
										>{#if item.content.length > 80}{item.content.slice(
												0,
												75
											)}...{:else}{item.content}{/if}</a
									></span
								>{:then ogp}
								{#if $ogpStore[item.content] && $ogpStore[item.content].title && $ogpStore[item.content].title !== ''}
									<OGP ogp={$ogpStore[item.content]} url={item.content} />
								{:else}<a class="anchor" href={item.content} target="_blank"
										>{#if item.content.length > 80}{item.content.slice(
												0,
												75
											)}...{:else}{item.content}{/if}</a
									>{/if}
							{/await}
						{/if}
					{:else}<a class="anchor" href={item.content} target="_blank"
							>{#if item.content.length > 80}{item.content.slice(0, 75)}...
							{:else}{item.content}{/if}</a
						>{/if}
				{:else if item.type === 'image'}
					{#if $URLPreview}<span
							class="w-[fit-content] inline-flex flex align-bottom"
							><!-- svelte-ignore a11y-no-noninteractive-element-interactions --><!-- svelte-ignore a11y-click-events-have-key-events --><img
								class="max-h-[10em] object-contain"
								src={item.content}
								alt=""
								loading="lazy"
								on:click={() => handleClickImage(item.content)}
							/></span
						>{:else}<span class="break-all break-all"
							><a class="anchor" href={item.content} target="_blank"
								>{#if item.content.length > 80}{item.content.slice(
										0,
										75
									)}...{:else}{item.content}{/if}</a
							></span
						>{/if}{:else if item.type === 'nostr' && item.url}
					{#if decodeCheck(item.url)}
						<QuoteContent encodedId={item.url} {isPageOwner} {pubkey} />
					{:else}<span>{item.content}</span>{/if}
				{:else if item.type === 'quote' && item.number !== undefined}
					<!--引用タグの中身がパブキーの時-->
					{#if tag[item.number][0] === 'p'}
						<Metadata
							queryKey={['metadata', tag[item.number][1]]}
							pubkey={tag[item.number][1]}
							let:metadata
						>
							<div slot="loading">
								<div class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden">
									{tag[item.number][1]}
								</div>
							</div>
							<div slot="error">
								<div class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden">
									{tag[item.number][1]}
								</div>
							</div>

							<div slot="nodata">
								<div class="-mt-0.5 px-2 opacity-60 text-sm overflow-hidden">
									{tag[item.number][1]}
								</div>
							</div>

							<button
								class="flex inline-flex text-surface-600 dark:text-surface-300"
								on:click={() => {
									const test = item.number === undefined ? 0 : item.number;
									handleClickPubkey(metadata);
								}}
								><u
									>@{#if JSON.parse(metadata.content).name !== ''}{JSON.parse(
											metadata.content
										).name}
									{:else if item.number !== undefined}
										{nip19.npubEncode(tag[item.number][1]).slice(0, 12)}:{nip19
											.npubEncode(tag[item.number][1])
											.slice(-4)}
									{/if}</u
								>
							</button>
						</Metadata>
					{:else if tag[item.number][0] === 'e' || tag[item.number][0] === 'q'}
						<!--引用タグの中身がイベントIDの時-->
						<QuoteContent2 id={tag[item.number][1]} {isPageOwner} {pubkey} />
					{:else if tag[item.number][0] === 't'}
						<button
							class="anchor"
							on:click={() => {
								console.log(item.number);
								if (item.number !== undefined) {
									goto(`../t/${tag[item.number][1]}`);
								}
							}}>#{tag[item.number][1]}</button
						>
					{:else}{tag[item.number][1]}
					{/if}{:else if item.type === 'hashtag'}<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<a
						class="anchor"
						rel="external noreferrer"
						target="_blank"
						href={encodedURL(item.content)}>{item.content}</a
					>
					<!-- <span
						class=" break-all anchor"
						on:click={() => {
							//https://github.com/akiomik/nosey
							const url=`https://nosey.vercel.app/?q=${item.content}`
							 
							//const url=`${window.location.origin}/t/${item.content.slice(1)}`
							goto(`${window.location.origin}/t/${item.content.slice(1)}`);
						}}
						>{item.content}
					</span> -->
				{:else if item.content.length > 0}
					<span style="	white-space: pre-wrap; word-break: break-word;"
						>{item.content}</span
					>{/if}
				<!-- </div> -->
			{/if}
		{/each}
	{/await}
{/if}

<style>
	/* .example {
		@apply text-primary-400;
	} */
</style>
